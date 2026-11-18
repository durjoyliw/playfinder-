"use client";

import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import type { ArenaWhen } from "@/lib/arena-when";
import { cn } from "@/lib/utils";
import Link from "next/link";

/**
 * Pieces shared by the Arena card and the Arena game page, so both read
 * the same way: date tile, spots dots, and the one main action.
 */

export function ArenaDateTile({
  when,
  label,
  sportEmoji,
  sportColour,
  size = "sm",
}: {
  when: ArenaWhen | null;
  label?: string;
  sportEmoji: string;
  sportColour: string;
  size?: "sm" | "lg";
}) {
  const box = size === "lg" ? "h-[52px] w-[52px] rounded-xl" : "h-11 w-11 rounded-[10px]";
  if (!when) {
    return (
      <div
        className={cn(
          "grid shrink-0 place-items-center",
          box,
          size === "lg" ? "text-[22px]" : "text-[19px]",
        )}
        style={{ background: `${sportColour}1f` }}
        aria-hidden
      >
        {sportEmoji || "🏅"}
      </div>
    );
  }
  const isTime = when.date.length > 2;
  return (
    <div
      className={cn(
        "flex shrink-0 flex-col items-center justify-center bg-[var(--pf-inset)]",
        box,
      )}
      aria-label={label}
    >
      <span
        className={cn(
          "font-semibold uppercase leading-none tracking-[0.04em]",
          size === "lg" ? "text-[10px]" : "text-[9px]",
          when.isToday
            ? "text-[var(--pf-volt-text)]"
            : "text-[var(--pf-c-ink-7e8a7e)]",
        )}
      >
        {when.dayLabel}
      </span>
      <span
        className={cn(
          "mt-[3px] font-bold leading-none text-[var(--pf-c-ink-f2f5ef)]",
          isTime
            ? size === "lg"
              ? "text-[13px]"
              : "text-[12px]"
            : size === "lg"
              ? "text-[20px]"
              : "text-[17px]",
        )}
      >
        {when.date}
      </span>
    </div>
  );
}

/** Max dots before only the count shows. */
const MAX_PIPS = 10;

export function ArenaSpotPips({
  accepted,
  total,
  size = "sm",
}: {
  accepted: number;
  total: number;
  size?: "sm" | "lg";
}) {
  if (total <= 0 || total > MAX_PIPS) return null;
  const dot = size === "lg" ? "h-2.5 w-2.5" : "h-1.5 w-1.5";
  return (
    <span
      className={cn("inline-flex shrink-0", size === "lg" ? "gap-1" : "gap-[2px]")}
      aria-hidden
    >
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={cn(
            "rounded-full",
            dot,
            i < accepted
              ? "bg-[var(--pf-volt)]"
              : "border border-[rgb(var(--pf-contrast-rgb)/0.3)]",
          )}
        />
      ))}
    </span>
  );
}

export function spotsText(spotsLeft: number, isFull: boolean, total?: number) {
  if (isFull || spotsLeft === 0) return "Full";
  const n = `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`;
  return total && total > spotsLeft ? `${spotsLeft} of ${total} spots left` : n;
}

/** Opens a chat with the poster, with a starter message. */
export function arenaMessageHref({
  authorId,
  name,
  isPage,
  sport,
}: {
  authorId: string;
  name: string;
  isPage: boolean;
  sport?: string;
}) {
  const draft = isPage
    ? `Hi, I'm interested in joining ${name}. Can you tell me more about trials or joining?`
    : `Hi ${name}, I saw your ${sport ? `${sport.toLowerCase()} ` : ""}post on PlayFinder. Is it still open?`;
  return `/messages?to=${encodeURIComponent(authorId)}&draft=${encodeURIComponent(draft)}`;
}

/**
 * The single main action:
 * someone else's game → I'm in (then Requested / You're in / Full),
 * your own post → Manage, a recruiting post → Message.
 */
export function ArenaMainAction({
  size = "sm",
  postId,
  authorId,
  name,
  sport,
  isPage,
  postHref,
  isOwnPost,
  isRecruiting,
  isFull,
  userInterestStatus,
}: {
  size?: "sm" | "lg";
  postId: string;
  authorId: string;
  name: string;
  sport?: string;
  isPage: boolean;
  postHref: string;
  isOwnPost: boolean;
  isRecruiting: boolean;
  isFull: boolean;
  userInterestStatus: string | null;
}) {
  const outline =
    "border border-[var(--pf-c-line-2a2f2a)] text-[var(--pf-c-ink-f2f5ef)] hover:bg-[var(--pf-c-fill-1e211e)]";
  const pill =
    size === "lg"
      ? "flex h-11 w-full items-center justify-center rounded-xl text-[15px] font-bold transition-colors"
      : "flex h-[30px] shrink-0 items-center justify-center whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold transition-colors";

  if (isOwnPost) {
    // The game page shows the host tools instead.
    if (size === "lg") return null;
    return (
      <Link href={postHref} className={cn(pill, outline)}>
        Manage
      </Link>
    );
  }
  if (isRecruiting) {
    return (
      <Link
        href={arenaMessageHref({ authorId, name, isPage, sport })}
        className={cn(pill, size === "lg" ? "bg-[var(--pf-volt)] text-[var(--pf-on-accent)]" : outline)}
      >
        Message
      </Link>
    );
  }
  if (size === "lg") {
    return (
      <div className="[&_button]:h-11 [&_button]:rounded-xl [&_button]:text-[15px]">
        <FeedCardImInButton
          postId={postId}
          authorId={authorId}
          isFull={isFull}
          userInterestStatus={userInterestStatus}
          fullWidth
        />
      </div>
    );
  }
  return (
    <FeedCardImInButton
      postId={postId}
      authorId={authorId}
      isFull={isFull}
      userInterestStatus={userInterestStatus}
      compact
    />
  );
}
