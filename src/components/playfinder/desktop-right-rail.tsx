"use client";

import { DesktopSearchBox } from "@/components/playfinder/desktop-search-box";
import { TrendingWidget } from "@/components/playfinder/trending-widget";
import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { filterActivePlayfinderPosts } from "@/lib/playfinder";
import { mapPostToHomeFeedCard } from "@/lib/home-feed-card";
import { PlayfinderPostsPage } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";

export function DesktopRightRail() {
  const { data: userSettings } = useUserSettings();
  const area = getDisplayArea(userSettings?.location);

  const { data: liveData } = useQuery({
    queryKey: ["playfinder", "active-count"],
    queryFn: () =>
      kyInstance.get("/api/playfinder/active-count").json<{ count: number }>(),
    refetchInterval: 60 * 1000,
  });

  const { data: arenaData } = useQuery({
    queryKey: ["post-feed", "playfinder", "all", "players"],
    queryFn: () =>
      kyInstance
        .get("/api/posts/playfinder", {
          searchParams: { sport: "all", tab: "arena" },
        })
        .json<PlayfinderPostsPage>(),
  });

  const openGames = filterActivePlayfinderPosts(arenaData?.posts ?? [])
    .slice(0, 2)
    .map((post) => mapPostToHomeFeedCard(post, false));

  const count = liveData?.count ?? 0;

  return (
    <div className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 px-6 py-3 font-grotesk xl:flex">
      <DesktopSearchBox />

      <div className="relative overflow-hidden rounded-2xl border border-[#2a2f2a] p-4">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 85% 50%, var(--pf-volt-glow), transparent 60%)",
            opacity: 0.12,
          }}
        />
        <p className="relative mb-3 text-[17px] font-bold text-[#f2f5ef]">
          Live{area !== "your area" ? ` in ${area}` : " near you"}
        </p>
        <div className="relative flex items-center gap-3.5">
          <div className="text-[28px] font-bold leading-none text-[#a1c217]">
            {count}
          </div>
          <div className="text-[13px] leading-snug text-[#b4bcaf]">
            <strong className="font-semibold text-[#f2f5ef]">
              athletes active
            </strong>{" "}
            nearby
          </div>
          <div className="pf-live-orb ml-auto" aria-hidden />
        </div>
      </div>

      {openGames.length > 0 && (
        <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
          <p className="mb-3 text-[17px] font-bold text-[#f2f5ef]">
            Open games near you
          </p>
          <div className="flex flex-col">
            {openGames.map((game, i) => (
              <Link
                key={game.postId}
                href={`/posts/${game.postId}?tab=arena`}
                className={
                  "flex items-center gap-2.5 py-2.5 transition-opacity hover:opacity-80" +
                  (i > 0 ? " border-t border-[#2a2f2a]" : "")
                }
              >
                {game.avatar.startsWith("http") ? (
                  <img
                    src={game.avatar}
                    alt=""
                    className="h-8 w-8 shrink-0 rounded-full object-cover"
                  />
                ) : (
                  <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#232824] text-xs font-bold text-[#b4bcaf]">
                    {game.avatar}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="truncate text-[13px] font-bold text-[#f2f5ef]">
                    {game.name}
                  </div>
                  <div className="truncate text-xs text-[#7e8a7e]">
                    {game.timeLabel ?? game.sport} &middot; {game.location}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      <TrendingWidget />
    </div>
  );
}
