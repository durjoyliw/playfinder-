"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import UserAvatar from "@/components/UserAvatar";

interface ComposeRowProps {
  onBroadcast?: () => void;
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ComposeRow({ onBroadcast }: ComposeRowProps) {
  const { user } = useSession();

  return (
    <div className="border-b border-border bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D]">
          {user.avatarUrl ? (
            <UserAvatar
              avatarUrl={user.avatarUrl}
              size={40}
              className="h-10 w-10 border-0"
            />
          ) : (
            <span className="text-sm font-bold text-black">
              {getInitials(user.displayName)}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onBroadcast}
          className="flex-1 text-left"
        >
          <p className="text-sm text-muted-foreground">
            Need players or a game?
          </p>
        </button>

        <button
          type="button"
          onClick={onBroadcast}
          className="rounded-full bg-[#C9F31D] px-4 py-2 text-xs font-bold uppercase tracking-wide text-black transition-colors hover:bg-[#d4f73a]"
        >
          BROADCAST
        </button>
      </div>
    </div>
  );
}
