"use client";

import type { DiscoverPlayer, DiscoverSportFilterId } from "@/lib/discover";
import { getDisplayArea } from "@/lib/location";
import { getInitials, PROFILE_INTENT_OPTIONS } from "@/lib/settings";
import { getSportLabel } from "@/lib/sports";
import kyInstance from "@/lib/ky";
import { ProfileIntent } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Navigation } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface PlayersNearYouFeedProps {
  selectedSport: DiscoverSportFilterId;
}

export function PlayersNearYouFeed({ selectedSport }: PlayersNearYouFeedProps) {
  const router = useRouter();

  const { data, status } = useQuery({
    queryKey: ["discover-players", selectedSport],
    queryFn: () =>
      kyInstance
        .get("/api/discover/players", {
          searchParams: { sport: selectedSport },
        })
        .json<{ players: DiscoverPlayer[] }>(),
  });

  const players = data?.players ?? [];
  const lfgCount = players.filter(
    (p) => p.profileIntent === ProfileIntent.LOOKING_TO_PLAY,
  ).length;

  const handleMessage = (player: DiscoverPlayer) => {
    const draft = `Hey ${player.displayName}! I found you on PlayFinder Discover — fancy a game?`;
    router.push(
      `/messages?to=${encodeURIComponent(player.id)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  return (
    <div className="bg-[#0d0d0d] px-4 pb-24">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#f0f0f0]">Players Near You</h2>
          <p className="text-[10px] text-[#666666]">Registered on PlayFinder</p>
        </div>
        {lfgCount > 0 && (
          <div className="flex items-center gap-1 rounded-full border border-[#C9F31D]/20 bg-[#C9F31D]/10 px-2 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-[#C9F31D]" />
            <span className="text-[10px] font-semibold text-[#C9F31D]">
              {lfgCount} LFG Today
            </span>
          </div>
        )}
      </div>

      {status === "pending" && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
        </div>
      )}

      {status === "error" && (
        <p className="py-6 text-center text-xs text-red-400">
          Failed to load players.
        </p>
      )}

      {status === "success" && players.length === 0 && (
        <p className="py-6 text-center text-xs text-[#666666]">
          No players found for this sport.
        </p>
      )}

      <div className="space-y-2">
        {status === "success" &&
          players.map((player) => (
            <PlayerCard
              key={player.id}
              player={player}
              onMessage={() => handleMessage(player)}
            />
          ))}
      </div>
    </div>
  );
}

function PlayerCard({
  player,
  onMessage,
}: {
  player: DiscoverPlayer;
  onMessage: () => void;
}) {
  const intent = player.profileIntent ?? ProfileIntent.LOOKING_TO_PLAY;
  const intentOption = PROFILE_INTENT_OPTIONS.find((o) => o.value === intent);
  const primarySport = player.sports[0];

  return (
    <article className="flex cursor-pointer items-center gap-3 rounded-xl border border-[#2a2a2a] bg-[#161616] p-3 transition-transform active:scale-[0.99]">
      <Link href={`/users/${player.username}`} className="shrink-0">
        <div className="flex h-11 w-11 items-center justify-center rounded-full border-2 border-[#2a2a2a] bg-[#C9F31D] text-sm font-bold text-black">
          {getInitials(player.displayName)}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <Link
            href={`/users/${player.username}`}
            className="truncate text-sm font-bold text-[#f0f0f0] hover:underline"
          >
            {player.displayName}
          </Link>
          {intentOption && (
            <span
              className={cn(
                "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase",
                intentOption.className,
              )}
            >
              {intentOption.label}
            </span>
          )}
        </div>

        {primarySport && (
          <p className="mt-0.5 text-[11px] text-[#666666]">
            Interest:{" "}
            <span className="font-medium text-[#C9F31D]">
              {getSportLabel(primarySport.sport)}
            </span>
            {player.sports[0] && (
              <>
                {" "}
                · Skill:{" "}
                <span className="font-medium capitalize text-[#C9F31D]">
                  {primarySport.skillLevel.toLowerCase()}
                </span>
              </>
            )}
          </p>
        )}

        {player.sports.length > 1 && (
          <div className="mt-1.5 flex flex-wrap gap-1">
            {player.sports.slice(0, 3).map(({ sport }) => (
              <span
                key={sport}
                className="rounded-full border border-[#C9F31D]/40 px-1.5 py-0.5 text-[9px] font-medium text-[#C9F31D]"
              >
                {getSportLabel(sport)}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-2">
        <div className="flex items-center gap-1 text-[10px] text-[#666666]">
          <Navigation className="h-3 w-3" />
          <span className="max-w-[72px] truncate">
            {getDisplayArea(player.location)}
          </span>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onMessage();
          }}
          className="rounded-md border border-[#C9F31D]/30 bg-[#C9F31D]/10 px-2 py-1 text-[9px] font-bold uppercase text-[#C9F31D]"
        >
          Message
        </button>
      </div>
    </article>
  );
}
