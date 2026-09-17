"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import FollowButton from "@/components/FollowButton";
import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { filterActivePlayfinderPosts } from "@/lib/playfinder";
import { mapPostToHomeFeedCard } from "@/lib/home-feed-card";
import { getInitials } from "@/lib/settings";
import type { DiscoverPlayer } from "@/lib/discover";
import { FollowerInfo, PlayfinderPostsPage } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const defaultFollowerInfo: FollowerInfo = {
  followers: 0,
  isFollowedByUser: false,
  isFollowedByThem: false,
  isTeammate: false,
};

export function ProfileDesktopRightRail() {
  const router = useRouter();
  const { user: viewer } = useSession();
  const { data: userSettings } = useUserSettings();
  const area = getDisplayArea(userSettings?.location);

  const { data: playersData } = useQuery({
    queryKey: ["discover", "players", "all"],
    queryFn: () =>
      kyInstance
        .get("/api/discover/players", { searchParams: { sport: "all" } })
        .json<{ players: DiscoverPlayer[] }>(),
  });

  const suggestions = (playersData?.players ?? [])
    .filter((p) => p.id !== viewer.id)
    .slice(0, 4);

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

  return (
    <div className="sticky top-0 hidden h-screen w-[350px] shrink-0 flex-col gap-4 px-6 py-3 font-grotesk lg:flex">
      <button
        type="button"
        onClick={() => router.push("/search")}
        className="flex items-center gap-2.5 rounded-full border border-[#2a2f2a] bg-[#131614] px-4 py-3 text-sm text-[#7e8a7e] transition-colors hover:border-[#353c34]"
      >
        <Search className="h-[18px] w-[18px] shrink-0" />
        Search PlayFinder
      </button>

      {suggestions.length > 0 && (
        <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
          <p className="mb-1 text-[17px] font-bold text-[#f2f5ef]">
            You might like
          </p>
          <div className="flex flex-col">
            {suggestions.map((player, i) => (
              <div
                key={player.id}
                className={
                  "flex items-center gap-2.5 py-2.5" +
                  (i > 0 ? " border-t border-[#2a2f2a]" : "")
                }
              >
                <Link
                  href={`/users/${player.username}`}
                  className="flex min-w-0 flex-1 items-center gap-2.5"
                >
                  {player.avatarUrl ? (
                    <img
                      src={player.avatarUrl}
                      alt=""
                      className="h-9 w-9 shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-[#232824] text-xs font-bold text-[#c9f31d]">
                      {getInitials(player.displayName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="truncate text-[13px] font-bold text-[#f2f5ef]">
                      {player.displayName}
                    </div>
                    <div className="truncate text-xs text-[#7e8a7e]">
                      @{player.username}
                    </div>
                  </div>
                </Link>
                <FollowButton
                  userId={player.id}
                  initialState={defaultFollowerInfo}
                  className="!h-auto flex-shrink-0 !px-3 !py-1.5 !text-xs"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {openGames.length > 0 && (
        <div className="rounded-2xl border border-[#2a2f2a] bg-[#131614] p-4">
          <p className="mb-3 text-[17px] font-bold text-[#f2f5ef]">
            Open games{area !== "your area" ? ` in ${area}` : " near you"}
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
    </div>
  );
}
