"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { useUserSettings } from "@/hooks/use-user-settings";
import { addRecentSearch } from "@/lib/recent-searches";
import { getDisplayArea } from "@/lib/location";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/(main)/SessionProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchClubRow } from "./SearchClubRow";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchFilterBar } from "./SearchFilterBar";
import { SearchGameCard } from "./SearchGameCard";
import { SearchHeader } from "./SearchHeader";
import { SearchLivePreview } from "./SearchLivePreview";
import { SearchPlayerRow, type SearchPlayerResult } from "./SearchPlayerRow";
import { SearchPostRow } from "./SearchPostRow";
import { searchClubsLocal, searchVenuesLocal } from "./search-local-data";
import { SearchVenueRow } from "./SearchVenueRow";

type SearchFilter = "all" | "profiles" | "posts" | "arena" | "venues" | "clubs";

const FILTER_PILLS: { id: SearchFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "profiles", label: "Profiles" },
  { id: "posts", label: "Posts" },
  { id: "arena", label: "Arena" },
  { id: "venues", label: "Venues" },
  { id: "clubs", label: "Clubs" },
];

/** How many of each type the "All" tab previews before "See all". */
const ALL_PREVIEW_COUNT = 3;

interface SearchPageClientProps {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useSession();
  const { data: userSettings } = useUserSettings();
  const urlQuery = searchParams.get("q")?.trim() ?? initialQuery;
  const [filter, setFilter] = useState<SearchFilter>("all");
  const [draftQuery, setDraftQuery] = useState(urlQuery);
  const [debouncedDraftQuery, setDebouncedDraftQuery] = useState(urlQuery);

  const areaLabel = getDisplayArea(userSettings?.location);

  useEffect(() => {
    setDraftQuery(urlQuery);
  }, [urlQuery]);

  useEffect(() => {
    if (urlQuery) addRecentSearch(urlQuery);
  }, [urlQuery]);

  // Live "as you type" preview: fires while the user is actively typing,
  // i.e. before they've submitted this exact query (matches X's behaviour
  // of showing results immediately instead of waiting for Enter).
  useEffect(() => {
    const id = window.setTimeout(
      () => setDebouncedDraftQuery(draftQuery.trim()),
      250,
    );
    return () => window.clearTimeout(id);
  }, [draftQuery]);

  const isTyping =
    draftQuery.trim().length > 0 && draftQuery.trim() !== urlQuery;

  const runSearch = useCallback(
    (query: string) => {
      const q = query.trim();
      if (!q) {
        router.push("/search");
        return;
      }
      addRecentSearch(q);
      router.push(`/search?q=${encodeURIComponent(q)}`);
    },
    [router],
  );

  const playersQuery = useQuery({
    queryKey: ["search", "players", urlQuery],
    queryFn: () =>
      kyInstance
        .get("/api/search/players", { searchParams: { q: urlQuery } })
        .json<{ players: SearchPlayerResult[] }>(),
    enabled: !!urlQuery,
  });

  const livePreviewQuery = useQuery({
    queryKey: ["search", "players", "preview", debouncedDraftQuery],
    queryFn: () =>
      kyInstance
        .get("/api/search/players", { searchParams: { q: debouncedDraftQuery } })
        .json<{ players: SearchPlayerResult[] }>(),
    enabled: isTyping && debouncedDraftQuery.length > 0,
  });

  const postsQuery = useInfiniteQuery({
    queryKey: ["search", "posts", urlQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search", {
          searchParams: {
            q: urlQuery,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!urlQuery,
  });

  const arenaQuery = useInfiniteQuery({
    queryKey: ["search", "arena", urlQuery],
    queryFn: ({ pageParam }) =>
      kyInstance
        .get("/api/search/games", {
          searchParams: {
            q: urlQuery,
            ...(pageParam ? { cursor: pageParam } : {}),
          },
        })
        .json<PostsPage>(),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    enabled: !!urlQuery,
  });

  const players = playersQuery.data?.players ?? [];

  const socialPosts = useMemo(
    () =>
      (postsQuery.data?.pages.flatMap((p) => p.posts) ?? []).filter(
        (post) => post.type === "SOCIAL",
      ),
    [postsQuery.data?.pages],
  );

  const arenaPosts = useMemo(
    () =>
      (arenaQuery.data?.pages.flatMap((p) => p.posts) ?? []).filter(
        (post) => post.type === "ARENA",
      ),
    [arenaQuery.data?.pages],
  );

  const venues = useMemo(
    () => (urlQuery ? searchVenuesLocal(urlQuery) : []),
    [urlQuery],
  );

  const clubs = useMemo(
    () => (urlQuery ? searchClubsLocal(urlQuery) : []),
    [urlQuery],
  );

  const isLoading =
    (filter === "all" &&
      (playersQuery.isFetching ||
        postsQuery.isFetching ||
        arenaQuery.isFetching)) ||
    (filter === "profiles" && playersQuery.isFetching) ||
    (filter === "posts" && postsQuery.isFetching) ||
    (filter === "arena" && arenaQuery.isFetching);

  const allCount =
    players.length +
    socialPosts.length +
    arenaPosts.length +
    venues.length +
    clubs.length;

  const resultsCount =
    filter === "all"
      ? allCount
      : filter === "profiles"
      ? players.length
      : filter === "posts"
        ? socialPosts.length
        : filter === "arena"
          ? arenaPosts.length
          : filter === "venues"
            ? venues.length
            : clubs.length;

  const resultsLabel = (() => {
    switch (filter) {
      case "all":
        return `Top results near ${areaLabel}`;
      case "profiles":
        return `${resultsCount} profile${resultsCount === 1 ? "" : "s"} near ${areaLabel}`;
      case "posts":
        return `${resultsCount} post${resultsCount === 1 ? "" : "s"}`;
      case "arena":
        return `${resultsCount} arena post${resultsCount === 1 ? "" : "s"} near ${areaLabel}`;
      case "venues":
        return `${resultsCount} venue${resultsCount === 1 ? "" : "s"} near ${areaLabel}`;
      case "clubs":
        return `${resultsCount} club${resultsCount === 1 ? "" : "s"} near ${areaLabel}`;
    }
  })();

  const emptyMessage = (() => {
    switch (filter) {
      case "all":
        return "No results found";
      case "profiles":
        return "No profiles found";
      case "posts":
        return "No posts found";
      case "arena":
        return "No arena posts found";
      case "venues":
        return "No venues found";
      case "clubs":
        return "No clubs found";
    }
  })();

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-5rem)] flex-col bg-[var(--pf-c-fill-08090a)] font-grotesk">
      <SearchHeader
        value={draftQuery}
        onChange={setDraftQuery}
        onSubmit={runSearch}
      />
      {isTyping ? (
        <SearchLivePreview
          query={draftQuery.trim()}
          players={livePreviewQuery.data?.players ?? []}
          isFetching={livePreviewQuery.isFetching}
          onSeeAllResults={() => runSearch(draftQuery)}
        />
      ) : !urlQuery ? (
        <div className="flex-1 overflow-y-auto">
          <SearchEmptyState onSearch={runSearch} />
        </div>
      ) : (
        <>
          <SearchFilterBar
            pills={FILTER_PILLS}
            active={filter}
            onChange={setFilter}
          />

          {isLoading && resultsCount === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--pf-volt-text)]" />
            </div>
          )}

          {!isLoading && (
            <p className="flex items-center gap-2 px-4 pb-2 text-sm text-[var(--pf-c-ink-666666)]">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[var(--pf-volt)]" />
              {resultsLabel}
            </p>
          )}

          {filter === "all" && (
            <div className="flex-1 overflow-y-auto pb-4">
              {!isLoading && allCount === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                  {emptyMessage}
                </p>
              )}
              <AllResultsSection
                title="Profiles"
                total={players.length}
                onSeeAll={() => setFilter("profiles")}
              >
                {players.slice(0, ALL_PREVIEW_COUNT).map((player) => (
                  <SearchPlayerRow
                    key={player.id}
                    player={player}
                    query={urlQuery}
                  />
                ))}
              </AllResultsSection>
              <AllResultsSection
                title="Posts"
                total={socialPosts.length}
                onSeeAll={() => setFilter("posts")}
              >
                {socialPosts.slice(0, ALL_PREVIEW_COUNT).map((post) => (
                  <SearchPostRow key={post.id} post={post} />
                ))}
              </AllResultsSection>
              <AllResultsSection
                title="Arena"
                total={arenaPosts.length}
                onSeeAll={() => setFilter("arena")}
              >
                {arenaPosts.slice(0, ALL_PREVIEW_COUNT).map((post) => (
                  <SearchGameCard key={post.id} post={post} />
                ))}
              </AllResultsSection>
              <AllResultsSection
                title="Venues"
                total={venues.length}
                onSeeAll={() => setFilter("venues")}
              >
                {venues.slice(0, ALL_PREVIEW_COUNT).map((venue) => (
                  <SearchVenueRow key={venue.id} venue={venue} />
                ))}
              </AllResultsSection>
              <AllResultsSection
                title="Clubs"
                total={clubs.length}
                onSeeAll={() => setFilter("clubs")}
              >
                {clubs.slice(0, ALL_PREVIEW_COUNT).map((club) => (
                  <SearchClubRow key={club.id} club={club} />
                ))}
              </AllResultsSection>
            </div>
          )}

          {filter === "profiles" && (
            <div className="flex-1 overflow-y-auto">
              {playersQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load profiles.
                </p>
              )}
              {playersQuery.isSuccess && players.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                  {emptyMessage}
                </p>
              )}
              {players.map((player) => (
                <SearchPlayerRow
                  key={player.id}
                  player={player}
                  query={urlQuery}
                />
              ))}
            </div>
          )}

          {filter === "posts" && (
            <div className="flex-1 overflow-y-auto">
              {postsQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load posts.
                </p>
              )}
              {postsQuery.isSuccess &&
                socialPosts.length === 0 &&
                !postsQuery.hasNextPage && (
                  <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                    {emptyMessage}
                  </p>
                )}
              {socialPosts.length > 0 && (
                <InfiniteScrollContainer
                  onBottomReached={() =>
                    postsQuery.hasNextPage &&
                    !postsQuery.isFetching &&
                    postsQuery.fetchNextPage()
                  }
                >
                  {socialPosts.map((post) => (
                    <SearchPostRow key={post.id} post={post} />
                  ))}
                  {postsQuery.isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--pf-volt-text)]" />
                    </div>
                  )}
                </InfiniteScrollContainer>
              )}
            </div>
          )}

          {filter === "arena" && (
            <div className="flex-1 overflow-y-auto">
              {arenaQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load arena posts.
                </p>
              )}
              {arenaQuery.isSuccess &&
                arenaPosts.length === 0 &&
                !arenaQuery.hasNextPage && (
                  <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                    {emptyMessage}
                  </p>
                )}
              {arenaPosts.length > 0 && (
                <InfiniteScrollContainer
                  onBottomReached={() =>
                    arenaQuery.hasNextPage &&
                    !arenaQuery.isFetching &&
                    arenaQuery.fetchNextPage()
                  }
                >
                  {arenaPosts.map((post) => (
                    <SearchGameCard key={post.id} post={post} />
                  ))}
                  {arenaQuery.isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[var(--pf-volt-text)]" />
                    </div>
                  )}
                </InfiniteScrollContainer>
              )}
            </div>
          )}

          {filter === "venues" && (
            <div className="flex-1 overflow-y-auto">
              {venues.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                  {emptyMessage}
                </p>
              )}
              {venues.map((venue) => (
                <SearchVenueRow key={venue.id} venue={venue} />
              ))}
            </div>
          )}

          {filter === "clubs" && (
            <div className="flex-1 overflow-y-auto">
              {clubs.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[var(--pf-c-ink-666666)]">
                  {emptyMessage}
                </p>
              )}
              {clubs.map((club) => (
                <SearchClubRow key={club.id} club={club} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

/** One result type on the "All" tab; hidden when it has no results. */
function AllResultsSection({
  title,
  total,
  onSeeAll,
  children,
}: {
  title: string;
  total: number;
  onSeeAll: () => void;
  children: React.ReactNode;
}) {
  if (total === 0) return null;
  return (
    <section className="border-b border-[var(--pf-border)] pb-1 pt-3 last:border-b-0">
      <div className="flex items-baseline justify-between px-4 pb-1.5">
        <h2 className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
          {title}
        </h2>
        <button
          type="button"
          onClick={onSeeAll}
          className="rounded-md text-[13px] font-semibold text-[var(--pf-volt-text)] outline-none focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]"
        >
          See all{total > ALL_PREVIEW_COUNT ? ` (${total})` : ""}
        </button>
      </div>
      {children}
    </section>
  );
}
