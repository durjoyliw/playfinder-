"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { getInitials } from "@/lib/settings";

interface ComposeRowProps {
  onBroadcast?: () => void;
}

export function ComposeRow({ onBroadcast }: ComposeRowProps) {
  const { user } = useSession();

  return (
    <div className="mx-4 mt-4 rounded-2xl border border-[#2a2f2a] bg-[#131614] px-[18px] py-3.5">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#232824] text-xs font-bold text-[#0a0b0a]">
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="grid h-full w-full place-items-center bg-[#c9f31d] text-[#0a0b0a]">
              {getInitials(user.displayName)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onBroadcast}
          className="min-w-0 flex-1 text-left text-sm text-[#7e8a7e]"
        >
          Need players or a game?
        </button>

        <button
          type="button"
          onClick={onBroadcast}
          className="shrink-0 rounded-[12px] bg-[#c9f31d] px-4 py-2 text-xs font-bold text-[#0a0b0a] transition-transform active:scale-95"
        >
          Broadcast
        </button>
      </div>
    </div>
  );
}
