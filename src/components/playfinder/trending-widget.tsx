"use client";

import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

interface TrendingTopic {
  sport: string;
  label: string;
  emoji: string;
  word: string;
  mentions: number;
}

function capitalize(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

/**
 * Top 5 trending topics, one per sport the viewer plays. Computed from
 * PlayFinder's own recent posts (not an external sports database -- see
 * /api/discover/trending), so it reflects real local activity instead of
 * generic world sports news.
 */
export function TrendingWidget() {
  const { data: userSettings } = useUserSettings();

  const { data } = useQuery({
    queryKey: ["discover", "trending"],
    queryFn: () =>
      kyInstance
        .get("/api/discover/trending")
        .json<{ trending: TrendingTopic[] }>(),
    staleTime: 5 * 60 * 1000,
  });

  const mySportIds = new Set((userSettings?.sports ?? []).map((s) => s.sport));
  const topics = (data?.trending ?? [])
    .filter((topic) => mySportIds.has(topic.sport))
    .slice(0, 5);

  return (
    <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
      <p className="mb-1 text-[17px] font-bold text-[#f2f5ef]">
        Trending in your sports
      </p>
      {topics.length === 0 ? (
        <p className="py-1.5 text-xs text-[#7e8a7e]">
          Nothing trending yet -- check back once there&apos;s more activity in
          your sports.
        </p>
      ) : (
        <div className="flex flex-col">
          {topics.map((topic, i) => (
            <Link
              key={topic.sport}
              href={`/search?q=${encodeURIComponent(topic.word)}`}
              className={
                "flex items-center justify-between gap-2 py-2.5 transition-opacity hover:opacity-80" +
                (i > 0 ? " border-t border-[#2a2f2a]" : "")
              }
            >
              <div className="min-w-0">
                <p className="truncate text-xs text-[#7e8a7e]">
                  {topic.emoji} {topic.label} · Trending
                </p>
                <p className="truncate text-sm font-bold text-[#f2f5ef]">
                  {capitalize(topic.word)}
                </p>
              </div>
              <span className="shrink-0 text-xs text-[#7e8a7e]">
                {topic.mentions} posts
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
