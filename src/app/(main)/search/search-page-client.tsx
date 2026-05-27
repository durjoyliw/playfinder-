"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { useUserSettings } from "@/hooks/use-user-settings";
import { addRecentSearch } from "@/lib/recent-searches";
import { getDisplayArea } from "@/lib/location";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconArrowLeft } from "@tabler/icons-react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/app/(main)/SessionProvider";
import { useCallback, useEffect, useMemo, useState } from "react";
import { SearchClubRow } from "./SearchClubRow";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchGameCard } from "./SearchGameCard";
import { SearchPlayerRow, type SearchPlayerResult } from "./SearchPlayerRow";
import { SearchPostRow } from "./SearchPostRow";
import { searchClubsLocal, searchVenuesLocal } from "./search-local-data";
import { SearchVenueRow } from "./SearchVenueRow";

type SearchFilter = "profiles" | "posts" | "arena" | "venues" | "clubs";

const FILTER_PILLS: { id: SearchFilter; label: string }[] = [
  { id: "profiles", label: "Profiles" },
  { id: "posts", label: "Posts" },
  { id: "arena", label: "Arena" },
  { id: "venues", label: "Venues" },
  { id: "clubs", label: "Clubs" },
];

interface SearchPageClientProps {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  useSession();
  const { data: userSettings } = useUserSettings();
  const urlQuery = searchParams.get("q")?.trim() ?? initialQuery;
  const [filter, setFilter] = useState<SearchFilter>("profiles");

  const areaLabel = getDisplayArea(userSettings?.location);

  useEffect(() => {
    if (urlQuery) addRecentSearch(urlQuery);
  }, [urlQuery]);

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
    (filter === "profiles" && playersQuery.isFetching) ||
    (filter === "posts" && postsQuery.isFetching) ||
    (filter === "arena" && arenaQuery.isFetching);

  const resultsCount =
    filter === "profiles"
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
    <div className="flex min-h-[calc(100dvh-3.5rem-5rem)] flex-col bg-[#0d0d0d]">
      {!urlQuery ? (
        <div className="flex-1 overflow-y-auto">
          <SearchEmptyState onSearch={runSearch} />
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2 px-4 py-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#161616] text-[#888888] transition-colors hover:text-white"
              aria-label="Back to home feed"
            >
              <IconArrowLeft className="h-4 w-4" stroke={2} />
            </button>

            <div className="flex min-w-0 flex-1 gap-2 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {FILTER_PILLS.map((pill) => {
                const isActive = filter === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => setFilter(pill.id)}
                    className={cn(
                      "shrink-0 whitespace-nowrap rounded-[20px] border px-4 py-2 text-sm transition-colors",
                      isActive
                        ? "border-[#C9F31D] bg-[#C9F31D] font-bold text-black"
                        : "border-[#2a2a2a] bg-[#161616] font-medium text-[#888888]",
                    )}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>

          {isLoading && resultsCount === 0 && (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
            </div>
          )}

          {!isLoading && (
            <p className="flex items-center gap-2 px-4 pb-2 text-sm text-[#666666]">
              <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#C9F31D]" />
              {resultsLabel}
            </p>
          )}

          {filter === "profiles" && (
            <div className="flex-1 overflow-y-auto">
              {playersQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load profiles.
                </p>
              )}
              {playersQuery.isSuccess && players.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[#666666]">
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
                  <p className="px-4 py-8 text-center text-sm text-[#666666]">
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
                      <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
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
                  <p className="px-4 py-8 text-center text-sm text-[#666666]">
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
                      <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
                    </div>
                  )}
                </InfiniteScrollContainer>
              )}
            </div>
          )}

          {filter === "venues" && (
            <div className="flex-1 overflow-y-auto">
              {venues.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[#666666]">
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
                <p className="px-4 py-8 text-center text-sm text-[#666666]">
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
