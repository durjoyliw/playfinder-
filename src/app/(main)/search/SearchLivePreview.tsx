"use client";

import { getInitials } from "@/lib/settings";
import { Loader2, Search } from "lucide-react";
import Link from "next/link";
import type { SearchPlayerResult } from "./SearchPlayerRow";

interface SearchLivePreviewProps {
  query: string;
  players: SearchPlayerResult[];
  isFetching: boolean;
  onSeeAllResults: () => void;
}

/**
 * X-style "as you type" preview: shown while the user is actively typing
 * (before they submit), so results appear immediately instead of requiring
 * Enter first. Reuses the same /api/search/players data the full Profiles
 * tab uses, so nothing about the underlying search changes -- this is just
 * an earlier, lighter-weight view of the same results.
 */
export function SearchLivePreview({
  query,
  players,
  isFetching,
  onSeeAllResults,
}: SearchLivePreviewProps) {
  return (
    <div className="flex-1 overflow-y-auto">
      {isFetching && players.length === 0 ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-[#A1C217]" />
        </div>
      ) : players.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-[#666666]">
          No profiles found for &ldquo;{query}&rdquo;
        </p>
      ) : (
        players.map((player) => (
          <Link
            key={player.id}
            href={`/users/${player.username}`}
            className="flex items-center gap-3 border-b border-[#111] px-4 py-3 transition-colors hover:bg-[#111]"
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A1C217] text-sm font-bold text-black">
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
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-bold text-white">
                {player.displayName}
              </p>
              <p className="truncate text-xs text-[#666666]">
                @{player.username}
              </p>
            </div>
          </Link>
        ))
      )}

      <button
        type="button"
        onClick={onSeeAllResults}
        className="flex w-full items-center gap-3 border-b border-[#111] px-4 py-3.5 text-left text-sm font-semibold text-[#A1C217] transition-colors hover:bg-[#111]"
      >
        <Search className="h-4 w-4 flex-shrink-0" />
        Search for &ldquo;{query}&rdquo;
      </button>
    </div>
  );
}
