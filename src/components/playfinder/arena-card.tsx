"use client";

import {
  ArenaDateTile,
  ArenaMainAction,
  ArenaSpotPips,
  spotsText,
} from "@/components/playfinder/arena-parts";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardSaveButton } from "@/components/playfinder/feed-card-save-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostViewerMenu } from "@/components/playfinder/post-viewer-menu";
import { SendPostDialog } from "@/components/playfinder/send-post-dialog";
import { parseArenaWhen } from "@/lib/arena-when";
import { cn } from "@/lib/utils";
import { PageType } from "@prisma/client";
import { IconFlame } from "@tabler/icons-react";
import { MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";

interface ArenaCardProps {
  postId: string;
  authorId: string;
  username: string;
  name: string;
  profileHref: string;
  postHref: string;
  authorPageType: PageType | null;
  sport?: string;
  sportEmoji: string;
  sportColour: string;
  content: string;
  timeLabel?: string;
  location: string;
  timestamp: string;
  createdAt?: string;
  imageUrl?: string;
  likes: number;
  isLikedByUser: boolean;
  replies: number;
  isHotTake: boolean;
  metaExtras: ReactNode;
  cardIndex: number;
  isOwnPost: boolean;
  isLookingToPlay: boolean;
  showSpots: boolean;
  acceptedCount: number;
  spotsLeft: number;
  pendingCount: number;
  isFull: boolean;
  userInterestStatus: string | null;
  isBookmarkedByUser: boolean;
}

const dot = (
  <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
    ·
  </span>
);

const iconBtn =
  "pf-hit flex min-h-8 items-center gap-1 text-[var(--pf-c-ink-7e8a7e)] transition-colors hover:text-[var(--pf-c-ink-f2f5ef)] active:scale-90 [&_span]:text-[12px] [&_svg]:h-[17px] [&_svg]:w-[17px]";

/**
 * Arena card: date tile, the game in three short lines, then like /
 * comment / share / send / save and one main action. Tapping anywhere
 * else on the card opens the game page.
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
  createdAt,
  imageUrl,
  likes,
  isLikedByUser,
  replies,
  isHotTake,
  metaExtras,
  cardIndex,
  isOwnPost,
  isLookingToPlay,
  showSpots,
  acceptedCount,
  spotsLeft,
  pendingCount,
  isFull,
  userInterestStatus,
  isBookmarkedByUser,
}: ArenaCardProps) {
  const router = useRouter();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const when = useMemo(
    () => parseArenaWhen(timeLabel, new Date(), createdAt),
    [timeLabel, createdAt],
  );
  const timeText = when ? when.time : timeLabel;
  const isRecruiting = !isLookingToPlay;
  const spotsTotal = acceptedCount + spotsLeft;

  // Tap anywhere that isn't a link/button → the game page.
  function onCardClick(e: React.MouseEvent<HTMLElement>) {
    const target = e.target as HTMLElement;
    if (!e.currentTarget.contains(target)) return; // portals (dialogs)
    if (target.closest("a,button,input,textarea,[role=menu]")) return;
    router.push(postHref);
  }

  return (
    <article
      onClick={onCardClick}
      className="relative animate-[pf-card-in_500ms_ease-in-out_backwards] cursor-pointer rounded-[14px] border border-[var(--pf-c-line-2a2f2a)] bg-[var(--pf-surface)] px-3 pb-1.5 pt-2.5"
      style={{ animationDelay: `${(cardIndex % 8) * 40}ms` }}
    >
      <PostViewerMenu
        postId={postId}
        authorId={authorId}
        authorUsername={username}
        authorName={name}
        className="!absolute right-1.5 top-1.5 z-10 has-[[aria-expanded=true]]:z-40"
      />

      <div className="flex gap-2.5">
        <ArenaDateTile
          when={when}
          label={timeLabel}
          sportEmoji={sportEmoji}
          sportColour={sportColour}
        />
        <div className="min-w-0 flex-1">
          <Link
            href={postHref}
            className="line-clamp-2 pr-6 text-[14px] font-semibold leading-[1.28] tracking-[-0.01em] text-[var(--pf-c-ink-f2f5ef)] [word-break:break-word]"
          >
            {content}
          </Link>

          <p className="mt-0.5 flex min-w-0 items-center gap-1 text-[11.5px] leading-[1.4] text-[var(--pf-c-ink-7e8a7e)]">
            {sport && (
              <>
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
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

          <p className="flex min-w-0 flex-wrap items-center gap-x-1 text-[11.5px] leading-[1.4] text-[var(--pf-c-ink-7e8a7e)]">
            by
            <Link
              href={profileHref}
              className="inline-flex items-center gap-1 font-semibold text-[var(--pf-c-ink-b4bcaf)] hover:underline"
            >
              {isOwnPost ? "You" : name}
            </Link>
            {isOwnPost ? (
              <span className="rounded px-1.5 py-px text-[10.5px] font-semibold text-[var(--pf-volt-text)] bg-[rgb(var(--pf-volt-rgb)/0.14)]">
                Your game
              </span>
            ) : (
              authorPageType && (
                <span className="rounded bg-[rgb(var(--pf-contrast-rgb)/0.07)] px-1.5 py-px text-[10.5px] font-semibold text-[var(--pf-c-ink-b4bcaf)]">
                  {authorPageType === PageType.VENUE ? "Venue" : "Club"}
                </span>
              )
            )}
            {dot}
            <span>{timestamp}</span>
            {isOwnPost && !isRecruiting && pendingCount > 0 && (
              <>
                {dot}
                <span className="font-medium text-[var(--pf-volt-text)]">
                  {pendingCount} interested
                </span>
              </>
            )}
            {!isRecruiting && showSpots && (
              <>
                {dot}
                <span className="inline-flex items-center gap-1">
                  <ArenaSpotPips accepted={acceptedCount} total={spotsTotal} />
                  <span className="font-medium text-[var(--pf-c-ink-b4bcaf)]">
                    {spotsText(spotsLeft, isFull)}
                  </span>
                </span>
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

          {imageUrl && (
            <Link
              href={postHref}
              className="mt-2 block aspect-[5/2] overflow-hidden rounded-[10px]"
            >
              <img src={imageUrl} alt="" className="h-full w-full object-cover" />
            </Link>
          )}

          <div className="mt-1 flex items-center justify-between gap-2">
            <div className="-ml-0.5 flex items-center gap-3.5">
              <FeedCardLikeButton
                postId={postId}
                initialState={{ likes, isLikedByUser }}
                className={cn(iconBtn, "gap-1")}
              />
              <Link
                href={`${postHref}#comments`}
                className={iconBtn}
                aria-label="Comments"
              >
                <MessageCircle />
                <span className="font-medium tabular-nums">{replies}</span>
              </Link>
              <FeedCardShareButton postId={postId} iconOnly className={iconBtn} />
              <button
                type="button"
                onClick={() => setSendDialogOpen(true)}
                className={iconBtn}
                aria-label="Send as message"
              >
                <Send />
              </button>
              <FeedCardSaveButton
                postId={postId}
                initialState={{ isBookmarkedByUser }}
                iconSize={17}
                className="pf-hit min-h-8 active:scale-90"
              />
            </div>
            <ArenaMainAction
              postId={postId}
              authorId={authorId}
              name={name}
              sport={sport}
              isPage={Boolean(authorPageType)}
              postHref={postHref}
              isOwnPost={isOwnPost}
              isRecruiting={isRecruiting}
              isFull={isFull}
              userInterestStatus={userInterestStatus}
            />
          </div>
        </div>
      </div>

      {sendDialogOpen && (
        <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
      )}
    </article>
  );
}
