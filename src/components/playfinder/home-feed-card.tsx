"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostViewerMenu } from "@/components/playfinder/post-viewer-menu";
import { SendPostDialog } from "@/components/playfinder/send-post-dialog";
import type { HomeFeedCardProps } from "@/lib/home-feed-card";
import { isLookingToPlayIntent } from "@/lib/playfinder";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
import { cn } from "@/lib/utils";
import { IconBolt, IconCheck, IconFlame, IconLock } from "@tabler/icons-react";
import { Clock, MapPin, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function HomeFeedCard({
  postId,
  authorId,
  username,
  intent,
  fromTab,
  avatar,
  name,
  timestamp,
  location,
  sport,
  content,
  timeLabel,
  imageUrl,
  likes,
  isLikedByUser,
  replies,
  showImInButton,
  isTeammate = false,
  isHotTake = false,
  visibility = "PUBLIC",
  cardIndex = 0,
  postType = null,
  acceptedCount = 0,
  spotsLeft = 0,
  isFull = false,
  userInterestStatus = null,
}: HomeFeedCardProps) {
  const { user } = useSession();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const profileHref = `/users/${username}`;
  const hasPhoto = avatar.startsWith("http");
  const voltAvatar = cardIndex % 2 === 0;
  const isOwnPost = user.id === authorId;
  const isLookingToPlay = isLookingToPlayIntent(intent);
  const tabParam = fromTab ?? "social";
  const postHref = `/posts/${postId}?tab=${tabParam}`;
  const isArenaPost = postType === "ARENA" || postType === "BROADCAST";
  const showSpots = isArenaPost && (acceptedCount > 0 || spotsLeft > 0);
  const isArenaLayout = fromTab === "arena";
  const sportColour = getSportColour(sport);
  const sportEmoji = sport ? getSportEmoji(sport) : "";
  const spotsTotal = acceptedCount + spotsLeft;
  const fillPercent = spotsTotal > 0 ? (acceptedCount / spotsTotal) * 100 : 0;

  const avatarEl = (
    <Link href={profileHref} className="shrink-0">
      {hasPhoto ? (
        <img
          src={avatar}
          alt=""
          className="h-11 w-11 rounded-full object-cover"
        />
      ) : (
        <div
          className={cn(
            "grid h-11 w-11 place-items-center rounded-full text-sm font-bold",
            voltAvatar
              ? "bg-[#a1c217] text-[#0a0b0a]"
              : "bg-[#232824] text-[#b4bcaf]",
          )}
        >
          {avatar}
        </div>
      )}
    </Link>
  );

  const metaExtras = (
    <>
      {isTeammate && (
        <>
          <span className="text-[#5a635a]" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-[#a1c217]/70">
            <IconBolt className="h-3 w-3" stroke={2} aria-hidden />
            Teammate
          </span>
        </>
      )}
      {visibility === "TEAMMATES_ONLY" && (
        <>
          <span className="text-[#5a635a]" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-[#7e8a7e]">
            <IconLock className="h-3 w-3" stroke={1.75} aria-hidden />
            Teammates only
          </span>
        </>
      )}
    </>
  );

  const imInRow = showImInButton && isLookingToPlay && !isOwnPost && (
    <div className="mb-3">
      <FeedCardImInButton
        postId={postId}
        authorId={authorId}
        isFull={isFull}
        userInterestStatus={userInterestStatus}
        fullWidth
      />
    </div>
  );

  const actionRow = (
    <div className="flex items-center justify-between gap-4">
      <span className="flex min-w-0 items-center gap-1.5 text-[13px] text-[#7e8a7e]">
        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
        <span className="truncate">{location}</span>
      </span>

      <div className="flex flex-shrink-0 items-center gap-4">
        <FeedCardLikeButton
          postId={postId}
          initialState={{ likes, isLikedByUser }}
          className="min-h-9 gap-[7px] text-[13px] font-medium"
        />
        <Link
          href={postHref}
          className="flex min-h-9 items-center gap-1.5 text-[13px] font-medium text-[#7e8a7e] transition-transform hover:text-[#f2f5ef] active:scale-90"
          aria-label="View comments"
        >
          <MessageCircle className="h-5 w-5" />
          {replies}
        </Link>
        <FeedCardShareButton
          postId={postId}
          iconOnly
          className="min-h-9 text-[#7e8a7e] hover:text-[#f2f5ef] active:scale-90"
        />
        <button
          type="button"
          onClick={() => setSendDialogOpen(true)}
          className="flex min-h-9 items-center text-[#7e8a7e] transition-transform hover:text-[#f2f5ef] active:scale-90"
          aria-label="Send as message"
        >
          <Send className="h-[18px] w-[18px]" />
        </button>
      </div>
    </div>
  );

  const spotsRow = showSpots && (
    <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-black/20 p-3.5">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 text-xs text-[#7e8a7e]">
          <b className="text-[15px] font-bold text-[#a1c217]">{spotsLeft}</b>{" "}
          {spotsLeft === 1 ? "spot" : "spots"} available
        </div>
        <div className="h-[5px] overflow-hidden rounded-[3px] bg-white/[0.08]">
          <div
            className="h-full rounded-[3px]"
            style={{
              width: `${fillPercent}%`,
              background: sportColour,
            }}
          />
        </div>
      </div>
      <div className="flex">
        {Array.from({ length: acceptedCount }).map((_, i) => (
          <div
            key={`filled-${i}`}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border-2 border-[#1a1e1b] bg-[#a1c217]/10",
              i > 0 && "-ml-2.5",
            )}
          >
            <IconCheck size={14} color="#A1C217" stroke={2.5} />
          </div>
        ))}
        {Array.from({ length: Math.min(spotsLeft, 3) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border-2 border-dashed border-white/10 text-[11px] text-[#5a635a]",
              (acceptedCount > 0 || i > 0) && "-ml-2.5",
            )}
          >
            +
          </div>
        ))}
      </div>
    </div>
  );

  if (isArenaLayout) {
    return (
      <article
        className="relative animate-[pf-card-in_500ms_ease-in-out_backwards] overflow-hidden rounded-[18px] border border-[#2a2f2a] transition-transform active:scale-[0.98]"
        style={{
          background:
            "linear-gradient(160deg, var(--pf-surface-2), var(--pf-surface))",
          animationDelay: `${(cardIndex % 8) * 40}ms`,
        }}
      >
        <div className="h-[3px] w-full" style={{ background: sportColour }} />
        <PostViewerMenu
          postId={postId}
          authorId={authorId}
          authorUsername={username}
          authorName={name}
          className="absolute left-3.5 top-3.5 z-10"
        />
        {isHotTake && (
          <div className="absolute right-3.5 top-3.5 z-10 inline-flex items-center gap-1 rounded-md border border-[#a1c217]/20 bg-[#a1c217]/10 px-[9px] py-1.5 font-dm-mono text-[9px] font-semibold tracking-[0.1em] text-[#a1c217]">
            <IconFlame className="h-3 w-3" stroke={2} aria-hidden />
            LIVE SOON
          </div>
        )}

        <div className="p-[18px]">
          <div className="mb-3.5 flex items-start gap-3">
            <div className="min-w-0 flex-1">
              <div className="text-[17px] font-bold leading-snug tracking-[-0.02em] text-[#f2f5ef]">
                {content}
              </div>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-1 text-xs text-[#7e8a7e]">
                by{" "}
                <Link
                  href={profileHref}
                  className="font-semibold text-[#b4bcaf] hover:underline"
                >
                  {name}
                </Link>
                <span className="text-[#5a635a]" aria-hidden>
                  ·
                </span>
                <span>{timestamp}</span>
                {metaExtras}
              </div>
            </div>
            {sport && (
              <div
                className="flex shrink-0 items-center gap-1 rounded-[9px] px-2.5 py-1.5 text-xs font-semibold"
                style={{
                  color: sportColour,
                  background: `${sportColour}1f`,
                }}
              >
                {sportEmoji} {sport}
              </div>
            )}
          </div>

          {imageUrl && (
            <Link
              href={postHref}
              className="relative mb-4 block aspect-[16/10] overflow-hidden rounded-2xl"
            >
              <img
                src={imageUrl}
                alt=""
                className="h-full w-full object-cover"
              />
              <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent to-50%" />
            </Link>
          )}

          {(timeLabel || location) && (
            <div className="mb-4 grid grid-cols-2 gap-2.5">
              {timeLabel && (
                <div className="rounded-[14px] border border-white/[0.03] bg-black/25 p-3.5">
                  <div className="mb-2 flex items-center gap-1 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#5a635a]">
                    <Clock className="h-3 w-3" />
                    When
                  </div>
                  <div className="text-sm font-semibold text-[#f2f5ef]">
                    {timeLabel}
                  </div>
                </div>
              )}
              {location && (
                <div className="rounded-[14px] border border-white/[0.03] bg-black/25 p-3.5">
                  <div className="mb-2 flex items-center gap-1 font-dm-mono text-[9px] font-medium uppercase tracking-[0.1em] text-[#5a635a]">
                    <MapPin className="h-3 w-3" />
                    Where
                  </div>
                  <div className="text-sm font-semibold text-[#a1c217]">
                    {location}
                  </div>
                </div>
              )}
            </div>
          )}

          {spotsRow}

          {showImInButton && isLookingToPlay && !isOwnPost && (
            <div className="mb-4 [&_button]:min-h-[52px] [&_button]:rounded-[14px] [&_button]:text-[15px] [&_button]:font-bold">
              <FeedCardImInButton
                postId={postId}
                authorId={authorId}
                isFull={isFull}
                userInterestStatus={userInterestStatus}
                fullWidth
              />
            </div>
          )}

          {actionRow}
        </div>

        {sendDialogOpen && (
          <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
        )}
      </article>
    );
  }

  return (
    <article
      className="animate-[pf-card-in_500ms_ease-in-out_backwards] border-b border-white/[0.04] px-4 py-4"
      style={{ animationDelay: `${(cardIndex % 8) * 40}ms` }}
    >
      <div className="mb-3.5 flex items-center gap-2">
        <PostViewerMenu
          postId={postId}
          authorId={authorId}
          authorUsername={username}
          authorName={name}
        />
        {avatarEl}
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="flex items-center gap-1 text-[15px] font-semibold text-[#f2f5ef] hover:underline"
          >
            {name}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[#7e8a7e]">
            {sport && (
              <span className="font-medium" style={{ color: sportColour }}>
                {sportEmoji} {sport}
              </span>
            )}
            {sport && (
              <span className="text-[#5a635a]" aria-hidden>
                ·
              </span>
            )}
            <span>{location}</span>
            <span className="text-[#5a635a]" aria-hidden>
              ·
            </span>
            <span>{timestamp}</span>
            {metaExtras}
          </p>
        </div>
        {isHotTake && (
          <span className="bg-[#ef9f27]/12 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#ef9f27]/25 px-1.5 py-0.5 font-dm-mono text-[9px] font-bold tracking-wide text-[#EF9F27]">
            <IconFlame className="h-3 w-3" stroke={2} aria-hidden />
            HOT TAKE
          </span>
        )}
      </div>

      <p className="mb-3 text-[15px] leading-normal text-[#f2f5ef] [word-break:break-word]">
        {content}
      </p>

      {spotsRow}

      {imageUrl && (
        <Link
          href={postHref}
          className="relative mb-3 block aspect-[16/10] overflow-hidden rounded-[14px]"
        >
          <img src={imageUrl} alt="" className="h-full w-full object-cover" />
          <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent to-50%" />
        </Link>
      )}

      {imInRow}

      {actionRow}

      {(timeLabel || location) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#7e8a7e]">
          {timeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              {timeLabel}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {location}
            </span>
          )}
        </div>
      )}

      {sendDialogOpen && (
        <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
      )}
    </article>
  );
}
