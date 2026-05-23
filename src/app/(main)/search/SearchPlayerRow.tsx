"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { getDisplayArea } from "@/lib/location";
import { getInitials } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

export interface SearchPlayerResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  intent: {
    label: string;
    dotClassName: string;
  };
  matchingSportKeys: string[];
  sports: { name: string; emoji: string; key: string }[];
}

interface SearchPlayerRowProps {
  player: SearchPlayerResult;
  query: string;
}

export function SearchPlayerRow({ player, query }: SearchPlayerRowProps) {
  const { user } = useSession();
  const router = useRouter();
  const isSelf = user.id === player.id;

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelf) return;
    const draft = `Hey ${player.displayName}! Found you on PlayFinder search — up for a game?`;
    router.push(
      `/messages?to=${encodeURIComponent(player.id)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  const distanceLabel = player.location
    ? getDisplayArea(player.location)
    : null;

  return (
    <div className="flex items-start gap-3 border-b border-[#111] px-4 py-3">
      <Link href={`/users/${player.username}`} className="flex-shrink-0">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-sm font-bold text-black">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(player.displayName)
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${player.username}`}
          className="font-bold text-white hover:underline"
        >
          {player.displayName}
        </Link>

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#666666]">
          <span
            className={cn("h-2 w-2 flex-shrink-0 rounded-full", player.intent.dotClassName)}
          />
          <span>{player.intent.label}</span>
          {distanceLabel && (
            <>
              <span>·</span>
              <span>{distanceLabel}</span>
            </>
          )}
        </div>

        {player.sports.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {player.sports.map((sport) => {
              const highlighted =
                player.matchingSportKeys.includes(sport.key) ||
                sport.name.toLowerCase().includes(query.toLowerCase()) ||
                sport.key.toLowerCase().includes(query.toLowerCase());

              return (
                <span
                  key={sport.key}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    highlighted
                      ? "bg-[#1f2d00] text-[#C9F31D]"
                      : "bg-[#1f1f1f] text-[#666666]",
                  )}
                >
                  {sport.emoji} {sport.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!isSelf && (
        <button
          type="button"
          onClick={handleMessage}
          className="flex-shrink-0 rounded-full bg-[#C9F31D] px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#d4f73a]"
        >
          Message
        </button>
      )}
    </div>
  );
}
