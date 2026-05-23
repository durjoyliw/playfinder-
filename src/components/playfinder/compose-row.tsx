"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { getInitials } from "@/lib/settings";

interface ComposeRowProps {
  onBroadcast?: () => void;
}

export function ComposeRow({ onBroadcast }: ComposeRowProps) {
  const { user } = useSession();

  return (
    <div className="mx-3 mb-3 rounded-[14px] bg-[#1a1a1a] px-3.5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-xs font-bold text-[#888888]">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(user.displayName)
          )}
        </div>

        <button
          type="button"
          onClick={onBroadcast}
          className="min-w-0 flex-1 text-left text-sm text-[#888888]"
        >
          Need players or a game?
        </button>

        <button
          type="button"
          onClick={onBroadcast}
          className="flex-shrink-0 rounded-xl bg-[#C9F31D] px-4 py-2 text-xs font-bold text-black transition-colors hover:bg-[#d4f73a]"
        >
          Broadcast
        </button>
      </div>
    </div>
  );
}
