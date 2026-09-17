"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { getInitials } from "@/lib/settings";

interface ComposeRowProps {
  onBroadcast?: () => void;
}

export function ComposeRow({ onBroadcast }: ComposeRowProps) {
  const { user } = useSession();

  return (
    <button
      type="button"
      onClick={onBroadcast}
      className="mx-4 mb-2 flex w-[calc(100%-32px)] items-center gap-2.5 rounded-[14px] border border-[#2a2f2a] bg-[#131614] px-3.5 py-2.5 transition-[border-color,transform] active:scale-[0.98] active:border-[#353c34]"
    >
      <div className="grid h-8 w-8 shrink-0 place-items-center overflow-hidden rounded-full bg-[#c9f31d] text-[13px] font-bold text-[#0a0b0a]">
        {user.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(user.displayName).slice(0, 1)
        )}
      </div>

      <span className="min-w-0 flex-1 text-left text-sm font-medium text-[#7e8a7e]">
        Need players or a game?
      </span>

      <span
        className="shrink-0 rounded-full px-3.5 py-1.5 text-[13px] font-bold text-[#c9f31d]"
        style={{ background: "rgba(201,243,29,0.12)" }}
      >
        Broadcast
      </span>
    </button>
  );
}
