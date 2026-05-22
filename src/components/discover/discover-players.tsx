"use client";

import UserAvatar from "@/components/UserAvatar";
import {
  DISCOVER_SPORT_FILTERS,
  type DiscoverPlayer,
  type DiscoverSportFilterId,
} from "@/lib/discover";
import { getDisplayArea } from "@/lib/location";
import { getInitials, PROFILE_INTENT_OPTIONS } from "@/lib/settings";
import { getSportLabel } from "@/lib/sports";
import kyInstance from "@/lib/ky";
import { ProfileIntent } from "@prisma/client";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function DiscoverPlayers() {
  const [sportFilter, setSportFilter] =
    useState<DiscoverSportFilterId>("all");

  const { data, status } = useQuery({
    queryKey: ["discover-players", sportFilter],
    queryFn: () =>
      kyInstance
        .get("/api/discover/players", {
          searchParams: { sport: sportFilter },
        })
        .json<{ players: DiscoverPlayer[] }>(),
  });

  const players = data?.players ?? [];

  return (
    <section className="flex flex-col bg-[#0d0d0d]">
      <div className="border-b border-[#2a2a2a] px-4 py-3">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-[#666666]">
          Players near you
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {DISCOVER_SPORT_FILTERS.map((filter) => {
            const isActive = sportFilter === filter.id;
            return (
              <button
                key={filter.id}
                type="button"
                onClick={() => setSportFilter(filter.id)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive
                    ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                    : "border-[#2a2a2a] bg-[#161616] text-[#f0f0f0] hover:border-[#3a3a3a]"
                }`}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3 px-4 py-4">
        {status === "pending" && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
          </div>
        )}

        {status === "error" && (
          <p className="py-12 text-center text-sm text-red-400">
            Failed to load players. Please try again.
          </p>
        )}

        {status === "success" && players.length === 0 && (
          <p className="py-12 text-center text-sm text-[#666666]">
            No players found for this sport yet.
          </p>
        )}

        {status === "success" &&
          players.map((player) => (
            <DiscoverPlayerCard key={player.id} player={player} />
          ))}
      </div>
    </section>
  );
}

function DiscoverPlayerCard({ player }: { player: DiscoverPlayer }) {
  const router = useRouter();
  const intent = player.profileIntent as ProfileIntent | null;
  const intentOption = PROFILE_INTENT_OPTIONS.find(
    (o) => o.value === (intent ?? ProfileIntent.LOOKING_TO_PLAY),
  );

  const handleMessage = () => {
    const draft = `Hey ${player.displayName}! I found you on PlayFinder Discover — fancy a game?`;
    router.push(
      `/messages?to=${encodeURIComponent(player.id)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  return (
    <article className="rounded-xl border border-[#2a2a2a] bg-[#161616] p-4">
      <div className="flex gap-3">
        <Link href={`/users/${player.username}`} className="flex-shrink-0">
          {player.avatarUrl ? (
            <UserAvatar avatarUrl={player.avatarUrl} size={48} />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C9F31D] text-sm font-bold text-black">
              {getInitials(player.displayName)}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <Link
            href={`/users/${player.username}`}
            className="font-semibold text-[#f0f0f0] hover:underline"
          >
            {player.displayName}
          </Link>
          <p className="mt-0.5 text-xs text-[#666666]">
            {getDisplayArea(player.location)}
          </p>

          {player.sports.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {player.sports.map(({ sport }) => (
                <span
                  key={sport}
                  className="rounded-full border border-[#C9F31D]/50 px-2 py-0.5 text-[10px] font-medium text-[#C9F31D]"
                >
                  {getSportLabel(sport)}
                </span>
              ))}
            </div>
          )}

          {intentOption && (
            <span
              className={`mt-2 inline-block rounded-full border px-2.5 py-0.5 text-[10px] font-medium ${intentOption.className}`}
            >
              {intentOption.label}
            </span>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleMessage}
        className="mt-3 w-full rounded-lg border border-[#C9F31D] py-2 text-sm font-semibold text-[#C9F31D] transition-colors hover:bg-[#C9F31D]/10"
      >
        Message
      </button>
    </article>
  );
}
