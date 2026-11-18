"use client";

import {
  ArenaDateTile,
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
import { Clock, MessageCircle, Send } from "lucide-react";
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

const tagVolt =
  "rounded bg-[rgb(var(--pf-volt-rgb)/0.14)] px-1.5 py-px text-[11px] font-semibold text-[var(--pf-volt-text)]";
const tagGrey =
  "rounded bg-[rgb(var(--pf-contrast-rgb)/0.07)] px-1.5 py-px text-[11px] font-semibold text-[var(--pf-c-ink-b4bcaf)]";

const dot = (
  <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
    ·
  </span>
);

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
  const joinTag =
    userInterestStatus === "ACCEPTED"
      ? "✓ You're in"
      : userInterestStatus === "PENDING"
        ? "✓ Requested"
        : null;

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
      className="animate-[pf-card-in_500ms_ease-in-out_backwards] cursor-pointer border-b border-[rgb(var(--pf-contrast-rgb)/0.04)] px-4 py-4"
      style={{ animationDelay: `${(cardIndex % 8) * 40}ms` }}
    >
      {/* Social's header, size for size: tile where the avatar sits,
          name, then the sport / place / time line. */}
      <div className="mb-3.5 flex items-center gap-2">
        <ArenaDateTile
          when={when}
          label={timeLabel}
          sportEmoji={sportEmoji}
          sportColour={sportColour}
        />
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 flex-wrap items-center gap-1.5">
            <Link
              href={profileHref}
              className="text-[15px] font-semibold text-[var(--pf-c-ink-f2f5ef)] hover:underline"
            >
              {isOwnPost ? "You" : name}
            </Link>
            {isOwnPost ? (
              <span className={tagVolt}>Your game</span>
            ) : (
              <>
                {authorPageType && (
                  <span className={tagGrey}>
                    {authorPageType === PageType.VENUE ? "Venue" : "Club"}
                  </span>
                )}
                {!isRecruiting && joinTag && (
                  <span className={tagVolt}>{joinTag}</span>
                )}
              </>
            )}
          </div>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--pf-c-ink-7e8a7e)]">
            {sport && (
              <span className="font-medium" style={{ color: sportColour }}>
                {sportEmoji} {sport}
              </span>
            )}
            {location && (
              <>
                {sport && dot}
                <span>{location}</span>
              </>
            )}
            {(sport || location) && dot}
            <span>{timestamp}</span>
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
        <PostViewerMenu
          postId={postId}
          authorId={authorId}
          authorUsername={username}
          authorName={name}
        />
      </div>

      <Link
        href={postHref}
        className="mb-3 block text-[15px] leading-normal text-[var(--pf-c-ink-f2f5ef)] [word-break:break-word]"
      >
        {content}
      </Link>

      {/* The game details, in the same small text as the meta line. */}
      {(timeText || (!isRecruiting && (showSpots || pendingCount > 0))) && (
        <p className="mb-3 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--pf-c-ink-7e8a7e)]">
          {timeText && (
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              {timeText}
            </span>
          )}
          {!isRecruiting && showSpots && (
            <>
              {timeText && dot}
              <span className="inline-flex items-center gap-1">
                <ArenaSpotPips accepted={acceptedCount} total={spotsTotal} />
                <span className="font-medium text-[var(--pf-c-ink-b4bcaf)]">
                  {spotsText(spotsLeft, isFull)}
                </span>
              </span>
            </>
          )}
          {isOwnPost && !isRecruiting && pendingCount > 0 && (
            <>
              {dot}
              <span className="font-medium text-[var(--pf-volt-text)]">
                {pendingCount} interested
              </span>
            </>
          )}
        </p>
      )}

      {imageUrl && (
        <Link
          href={postHref}
          className="mb-3 block aspect-[16/10] overflow-hidden rounded-[14px]"
        >
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
        </Link>
      )}

      {/* Same icon row as a Social post. Joining happens on the game page. */}
      <div className="flex items-center">
        <div className="-mx-1.5 flex flex-1 items-center justify-between">
          <FeedCardLikeButton
            postId={postId}
            initialState={{ likes, isLikedByUser }}
            className="pf-hit min-h-9 gap-[7px] text-[13px] font-medium"
          />
          <Link
            href={`${postHref}#comments`}
            className="pf-hit flex min-h-9 items-center gap-1.5 text-[13px] font-medium text-[var(--pf-c-ink-7e8a7e)] transition-transform hover:text-[var(--pf-c-ink-f2f5ef)] active:scale-90"
            aria-label="View comments"
          >
            <MessageCircle className="h-5 w-5" />
            {replies}
          </Link>
          <FeedCardShareButton
            postId={postId}
            iconOnly
            className="pf-hit min-h-9 text-[var(--pf-c-ink-7e8a7e)] hover:text-[var(--pf-c-ink-f2f5ef)] active:scale-90"
          />
          <button
            type="button"
            onClick={() => setSendDialogOpen(true)}
            className="pf-hit flex min-h-9 items-center text-[var(--pf-c-ink-7e8a7e)] transition-transform hover:text-[var(--pf-c-ink-f2f5ef)] active:scale-90"
            aria-label="Send as message"
          >
            <Send className="h-[18px] w-[18px]" />
          </button>
          <FeedCardSaveButton
            postId={postId}
            initialState={{ isBookmarkedByUser }}
            iconSize={19}
            className="pf-hit active:scale-90"
          />
        </div>
      </div>

      {sendDialogOpen && (
        <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
      )}
    </article>
  );
}
