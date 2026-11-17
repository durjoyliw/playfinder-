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
      className="mx-4 mb-2 flex w-[calc(100%-32px)] items-center gap-4 rounded-[20px] border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-c-fill-131614)] px-5 py-5 transition-[border-color,transform] hover:border-[var(--pf-c-line-353c34)] active:scale-[0.98] active:border-[var(--pf-c-line-353c34)] pf-card"
    >
      <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--pf-volt)] text-base font-bold text-[var(--pf-on-accent)]">
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

      <span className="min-w-0 flex-1 text-left text-base font-medium text-[var(--pf-c-ink-7e8a7e)]">
        Need players or a game?
      </span>

      <span
        className="shrink-0 rounded-full px-5 py-2.5 text-sm font-bold text-[var(--pf-volt-text)]"
        style={{ background: "rgb(var(--pf-volt-rgb)/0.12)" }}
      >
        Broadcast
      </span>
    </button>
  );
}
