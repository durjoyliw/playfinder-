"use client";

import InfiniteScrollContainer from "@/components/InfiniteScrollContainer";
import { useSession } from "@/app/(main)/SessionProvider";
import { addRecentSearch } from "@/lib/recent-searches";
import { getDisplayArea } from "@/lib/location";
import kyInstance from "@/lib/ky";
import { PostsPage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { SearchEmptyState } from "./SearchEmptyState";
import { SearchGameCard } from "./SearchGameCard";
import { SearchHeader } from "./SearchHeader";
import { SearchPlayerRow, type SearchPlayerResult } from "./SearchPlayerRow";

type Tab = "players" | "games";

interface SearchPageClientProps {
  initialQuery: string;
}

export function SearchPageClient({ initialQuery }: SearchPageClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useSession();
  const urlQuery = searchParams.get("q")?.trim() ?? initialQuery;
  const [input, setInput] = useState(urlQuery);
  const [tab, setTab] = useState<Tab>("players");

  const areaLabel = getDisplayArea(user.location);

  useEffect(() => {
    setInput(urlQuery);
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

  const gamesQuery = useInfiniteQuery({
    queryKey: ["search", "games", urlQuery],
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
  const games = gamesQuery.data?.pages.flatMap((p) => p.posts) ?? [];

  const resultsCount =
    tab === "players" ? players.length : games.length;
  const resultsLabel =
    tab === "players"
      ? `${resultsCount} player${resultsCount === 1 ? "" : "s"} near ${areaLabel}`
      : `${resultsCount} active game${resultsCount === 1 ? "" : "s"} near ${areaLabel}`;

  return (
    <div className="flex min-h-[calc(100dvh-3.5rem-5rem)] flex-col bg-[#0d0d0d]">
      <SearchHeader
        value={input}
        onChange={setInput}
        onSubmit={runSearch}
      />

      {!urlQuery ? (
        <div className="flex-1 overflow-y-auto">
          <SearchEmptyState onSearch={runSearch} />
        </div>
      ) : (
        <>
          <div className="flex gap-2 px-4 py-3">
            {(["players", "games"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold capitalize transition-colors",
                  tab === t
                    ? "bg-[#C9F31D] text-black"
                    : "bg-[#1a1a1a] text-[#666666] hover:text-white",
                )}
              >
                {t}
              </button>
            ))}
          </div>

          {(playersQuery.isFetching || gamesQuery.isFetching) &&
            !players.length &&
            !games.length && (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
              </div>
            )}

          {!playersQuery.isFetching &&
            !gamesQuery.isFetching &&
            ((tab === "players" && playersQuery.isSuccess) ||
              (tab === "games" && gamesQuery.isSuccess)) && (
              <p className="flex items-center gap-2 px-4 pb-2 text-sm text-[#666666]">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-[#C9F31D]" />
                {resultsLabel}
              </p>
            )}

          {tab === "players" && (
            <div className="flex-1 overflow-y-auto">
              {playersQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load players.
                </p>
              )}
              {playersQuery.isSuccess && players.length === 0 && (
                <p className="px-4 py-8 text-center text-sm text-[#666666]">
                  No players found
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

          {tab === "games" && (
            <div className="flex-1 overflow-y-auto">
              {gamesQuery.isError && (
                <p className="px-4 py-8 text-center text-sm text-red-400">
                  Failed to load games.
                </p>
              )}
              {gamesQuery.isSuccess &&
                !games.length &&
                !gamesQuery.hasNextPage && (
                  <p className="px-4 py-8 text-center text-sm text-[#666666]">
                    No active games found
                  </p>
                )}
              {games.length > 0 && (
                <InfiniteScrollContainer
                  onBottomReached={() =>
                    gamesQuery.hasNextPage &&
                    !gamesQuery.isFetching &&
                    gamesQuery.fetchNextPage()
                  }
                >
                  {games.map((post) => (
                    <SearchGameCard key={post.id} post={post} />
                  ))}
                  {gamesQuery.isFetchingNextPage && (
                    <div className="flex justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
                    </div>
                  )}
                </InfiniteScrollContainer>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
