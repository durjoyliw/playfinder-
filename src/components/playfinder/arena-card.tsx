"use client";

import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { usePostBookmark } from "@/components/playfinder/feed-card-save-button";
import { PostViewerMenu } from "@/components/playfinder/post-viewer-menu";
import { SendPostDialog } from "@/components/playfinder/send-post-dialog";
import { useToast } from "@/components/ui/use-toast";
import { parseArenaWhen } from "@/lib/arena-when";
import { cn } from "@/lib/utils";
import { PageType } from "@prisma/client";
import { IconFlame } from "@tabler/icons-react";
import { Bookmark, Link2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";

/** More pips than this and the row just shows the count. */
const MAX_PIPS = 10;

interface ArenaCardProps {
  postId: string;
  authorId: string;
  username: string;
  name: string;
  profileHref: string;
  postHref: string;
  authorPageType: PageType | null;
  intent?: string;
  sport?: string;
  sportEmoji: string;
  sportColour: string;
  content: string;
  timeLabel?: string;
  location: string;
  timestamp: string;
  imageUrl?: string;
  replies: number;
  isHotTake: boolean;
  metaExtras: ReactNode;
  cardIndex: number;
  isOwnPost: boolean;
  isLookingToPlay: boolean;
  showImInButton: boolean;
  showSpots: boolean;
  acceptedCount: number;
  spotsLeft: number;
  isFull: boolean;
  userInterestStatus: string | null;
  isBookmarkedByUser: boolean;
}

const dot = (
  <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
    ·
  </span>
);

/**
 * Compact Arena card: a date tile, the game in two lines, and one action.
 * Save / Share / Send live in the ⋯ menu so the card stays short.
 */
export function ArenaCard({
  postId,
  authorId,
  username,
  name,
  profileHref,
  postHref,
  authorPageType,
  sport,
  sportEmoji,
  sportColour,
  content,
  timeLabel,
  location,
  timestamp,
  imageUrl,
  replies,
  isHotTake,
  metaExtras,
  cardIndex,
  isOwnPost,
  isLookingToPlay,
  showImInButton,
  showSpots,
  acceptedCount,
  spotsLeft,
  isFull,
  userInterestStatus,
  isBookmarkedByUser,
}: ArenaCardProps) {
  const { toast } = useToast();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const { saved, setSaved } = usePostBookmark(postId, { isBookmarkedByUser });
  const when = useMemo(() => parseArenaWhen(timeLabel), [timeLabel]);
  const timeText = when ? when.time : timeLabel;
  const spotsTotal = acceptedCount + spotsLeft;
  const isRecruiting = !isLookingToPlay;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/posts/${postId}`,
      );
      toast({ description: "Link copied!", duration: 2000 });
    } catch {
      toast({ variant: "destructive", description: "Failed to copy link." });
    }
  };

  const menuItems = [
    {
      label: saved ? "Remove from Saved" : "Save",
      icon: (
        <Bookmark
          className={cn(saved && "fill-[var(--pf-volt)] text-[var(--pf-volt)]")}
        />
      ),
      onSelect: () => setSaved(!saved),
    },
    { label: "Copy link", icon: <Link2 />, onSelect: copyLink },
    {
      label: "Send as message",
      icon: <Send />,
      onSelect: () => setSendDialogOpen(true),
    },
  ];

  const tile = when ? (
    <div
      className="flex h-[52px] w-12 shrink-0 flex-col items-center justify-center rounded-xl bg-[var(--pf-inset)]"
      aria-label={timeLabel}
    >
      <span
        className={cn(
          "text-[10px] font-semibold uppercase leading-none tracking-[0.04em]",
          when.isToday
            ? "text-[var(--pf-volt-text)]"
            : "text-[var(--pf-c-ink-7e8a7e)]",
        )}
      >
        {when.dayLabel}
      </span>
      <span className="mt-1 text-[20px] font-bold leading-none text-[var(--pf-c-ink-f2f5ef)]">
        {when.date}
      </span>
    </div>
  ) : (
    <div
      className="grid h-[52px] w-12 shrink-0 place-items-center rounded-xl text-[22px]"
      style={{ background: `${sportColour}1f` }}
      aria-hidden
    >
      {sportEmoji || "🏅"}
    </div>
  );

  const pillClass =
    "flex h-9 shrink-0 items-center justify-center whitespace-nowrap rounded-full px-4 text-[13px] font-semibold transition-colors";

  let action: ReactNode = null;
  if (isOwnPost) {
    action = (
      <Link
        href={postHref}
        className={cn(
          pillClass,
          "border border-[var(--pf-c-line-2a2f2a)] text-[var(--pf-c-ink-f2f5ef)] hover:bg-[var(--pf-c-fill-1e211e)]",
        )}
      >
        Manage
      </Link>
    );
  } else if (isRecruiting) {
    const draft = `Hi, I'm interested in joining ${name}. Can you tell me more about trials or joining?`;
    action = (
      <Link
        href={`/messages?to=${encodeURIComponent(authorId)}&draft=${encodeURIComponent(draft)}`}
        className={cn(
          pillClass,
          "border border-[var(--pf-c-line-2a2f2a)] text-[var(--pf-c-ink-f2f5ef)] hover:bg-[var(--pf-c-fill-1e211e)]",
        )}
      >
        Message
      </Link>
    );
  } else if (showImInButton) {
    action = (
      <FeedCardImInButton
        postId={postId}
        authorId={authorId}
        isFull={isFull}
        userInterestStatus={userInterestStatus}
        compact
      />
    );
  }

  let status: ReactNode = null;
  if (isRecruiting) {
    status = (
      <span
        className="inline-flex h-6 items-center rounded-full px-2.5 text-[12px] font-semibold"
        style={{ color: sportColour, background: `${sportColour}1f` }}
      >
        Recruiting
      </span>
    );
  } else if (showSpots) {
    status = (
      <div className="flex min-w-0 items-center gap-2">
        {spotsTotal <= MAX_PIPS && (
          <div className="flex shrink-0 gap-[3px]" aria-hidden>
            {Array.from({ length: spotsTotal }).map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-2 w-2 rounded-full",
                  i < acceptedCount
                    ? "bg-[var(--pf-volt)]"
                    : "border border-[rgb(var(--pf-contrast-rgb)/0.25)]",
                )}
              />
            ))}
          </div>
        )}
        <span
          className={cn(
            "truncate text-[13px] font-medium",
            isFull || spotsLeft === 0
              ? "text-[var(--pf-c-ink-7e8a7e)]"
              : "text-[var(--pf-c-ink-b4bcaf)]",
          )}
        >
          {isFull || spotsLeft === 0
            ? "Full"
            : `${spotsLeft} ${spotsLeft === 1 ? "spot" : "spots"} left`}
        </span>
      </div>
    );
  }

  return (
    <article
      className="relative animate-[pf-card-in_500ms_ease-in-out_backwards] rounded-2xl border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-surface)] p-3"
      style={{ animationDelay: `${(cardIndex % 8) * 40}ms` }}
    >
      <PostViewerMenu
        postId={postId}
        authorId={authorId}
        authorUsername={username}
        authorName={name}
        extraItems={menuItems}
        className="!absolute right-2 top-2 z-10 has-[[aria-expanded=true]]:z-40"
      />

      <div className="flex gap-3">
        {tile}
        <div className="min-w-0 flex-1">
          <Link
            href={postHref}
            className="line-clamp-2 pr-7 text-base font-semibold leading-snug tracking-[-0.01em] text-[var(--pf-c-ink-f2f5ef)] [word-break:break-word] hover:underline"
          >
            {content}
          </Link>

          <p className="mt-1 flex min-w-0 items-center gap-1 text-[13px] text-[var(--pf-c-ink-7e8a7e)]">
            {sport && (
              <>
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: sportColour }}
                  aria-hidden
                />
                <span className="shrink-0 font-medium text-[var(--pf-c-ink-b4bcaf)]">
                  {sport}
                </span>
              </>
            )}
            {timeText && (
              <>
                {sport && dot}
                <span className="shrink-0">{timeText}</span>
              </>
            )}
            {location && (
              <>
                {(sport || timeText) && dot}
                <span className="truncate">{location}</span>
              </>
            )}
          </p>

          <p className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-1 text-[12px] text-[var(--pf-c-ink-7e8a7e)]">
            by
            <Link
              href={profileHref}
              className="inline-flex items-center gap-1 font-semibold text-[var(--pf-c-ink-b4bcaf)] hover:underline"
            >
              {name}
              {authorPageType && (
                <span className="text-[11px] font-medium text-[var(--pf-c-ink-7e8a7e)]">
                  ({authorPageType === PageType.VENUE ? "Venue" : "Club"})
                </span>
              )}
            </Link>
            {dot}
            <span>{timestamp}</span>
            {replies > 0 && (
              <>
                {dot}
                <Link
                  href={`${postHref}#comments`}
                  className="inline-flex items-center gap-0.5 hover:text-[var(--pf-c-ink-f2f5ef)]"
                  aria-label={`${replies} comments`}
                >
                  <MessageCircle className="h-3 w-3" aria-hidden />
                  {replies}
                </Link>
              </>
            )}
            {isHotTake && (
              <>
                {dot}
                <span className="inline-flex items-center gap-0.5 font-medium text-[var(--pf-volt-text)]">
                  <IconFlame className="h-3 w-3" stroke={2} aria-hidden />
                  Live soon
                </span>
              </>
            )}
            {metaExtras}
          </p>
        </div>
      </div>

      {imageUrl && (
        <Link
          href={postHref}
          className="mt-3 block aspect-[2/1] overflow-hidden rounded-xl"
        >
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </Link>
      )}

      {(status || action) && (
        <div className="mt-3 flex min-h-9 items-center justify-between gap-3">
          <div className="min-w-0">{status}</div>
          {action}
        </div>
      )}

      {sendDialogOpen && (
        <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
      )}
    </article>
  );
}
