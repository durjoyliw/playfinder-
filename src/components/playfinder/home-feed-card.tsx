"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { ArenaCard } from "@/components/playfinder/arena-card";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardSaveButton } from "@/components/playfinder/feed-card-save-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import { PostViewerMenu } from "@/components/playfinder/post-viewer-menu";
import { SendPostDialog } from "@/components/playfinder/send-post-dialog";
import type { HomeFeedCardProps } from "@/lib/home-feed-card";
import { isLookingToPlayIntent } from "@/lib/playfinder";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
import { cn } from "@/lib/utils";
import { IconBolt, IconCheck, IconFlame, IconLock } from "@tabler/icons-react";
import { PageType } from "@prisma/client";
import { Clock, MapPin, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function PageTypeChip({ type }: { type: PageType }) {
  const isVenue = type === PageType.VENUE;
  return (
    <span
      className={cn(
        "inline-flex h-[18px] shrink-0 items-center rounded-full border px-1.5 text-[8px] font-medium",
        isVenue
          ? "border-[rgba(201,162,39,0.32)] bg-[rgba(201,162,39,0.1)] text-[#c9a227]"
          : "border-[rgba(86,204,242,0.28)] bg-[rgba(86,204,242,0.1)] text-[#56ccf2]",
      )}
    >
      {isVenue ? "Venue" : "Club"}
    </span>
  );
}
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
  isBookmarkedByUser = false,
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
  authorPageHandle = null,
  authorPageType = null,
  createdAt,
  pendingCount = 0,
}: HomeFeedCardProps) {
  const { user } = useSession();
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const isPageAuthor = Boolean(authorPageHandle);
  const profileHref = isPageAuthor
    ? `/pages/${authorPageHandle}`
    : `/users/${username}`;
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
  const avatarRadius = isPageAuthor ? "rounded-[10px]" : "rounded-full";

  const avatarEl = (
    <Link href={profileHref} className="shrink-0">
      {hasPhoto ? (
        <img
          src={avatar}
          alt=""
          className={cn("h-11 w-11 object-cover", avatarRadius)}
        />
      ) : (
        <div
          className={cn(
            "grid h-11 w-11 place-items-center text-sm font-bold",
            avatarRadius,
            voltAvatar
              ? "bg-[var(--pf-volt)] text-[var(--pf-on-accent)]"
              : "bg-[var(--pf-c-fill-232824)] text-[var(--pf-c-ink-b4bcaf)]",
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
          <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-0.5 font-medium text-[rgb(var(--pf-volt-rgb)/0.7)]">
            <IconBolt className="h-3 w-3" stroke={2} aria-hidden />
            Teammate
          </span>
        </>
      )}
      {visibility === "TEAMMATES_ONLY" && (
        <>
          <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
            ·
          </span>
          <span className="inline-flex items-center gap-0.5 text-[11px] text-[var(--pf-c-ink-7e8a7e)]">
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

  // Five actions spread across the card (X / Instagram style): bigger,
  // easier targets, and the row lines up from card to card.
  const actionRow = (
    <div className="-mx-1.5 flex items-center justify-between">
      <FeedCardLikeButton
        postId={postId}
        initialState={{ likes, isLikedByUser }}
        className="pf-hit min-h-9 gap-[7px] text-[13px] font-medium"
      />
      <Link
        href={postHref}
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
  );

  const spotsRow = showSpots && (
    <div className="mb-4 flex items-center gap-3 rounded-[14px] bg-[var(--pf-inset)] p-3.5">
      <div className="min-w-0 flex-1">
        <div className="mb-1.5 text-xs text-[var(--pf-c-ink-7e8a7e)]">
          <b className="text-[15px] font-bold text-[var(--pf-volt-text)]">
            {spotsLeft}
          </b>{" "}
          {spotsLeft === 1 ? "spot" : "spots"} available
        </div>
        <div className="h-[5px] overflow-hidden rounded-[3px] bg-[rgb(var(--pf-contrast-rgb)/0.08)]">
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
              "grid h-8 w-8 place-items-center rounded-full border-2 border-[var(--pf-c-line-1a1e1b)] bg-[rgb(var(--pf-volt-rgb)/0.1)]",
              i > 0 && "-ml-2.5",
            )}
          >
            <IconCheck
              size={14}
              className="text-[var(--pf-volt-text)]"
              stroke={2.5}
            />
          </div>
        ))}
        {Array.from({ length: Math.min(spotsLeft, 3) }).map((_, i) => (
          <div
            key={`empty-${i}`}
            className={cn(
              "grid h-8 w-8 place-items-center rounded-full border-2 border-dashed border-[rgb(var(--pf-contrast-rgb)/0.1)] text-[11px] text-[var(--pf-c-ink-5a635a)]",
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
      <ArenaCard
        postId={postId}
        authorId={authorId}
        username={username}
        name={name}
        profileHref={profileHref}
        postHref={postHref}
        authorPageType={authorPageType}
        sport={sport}
        sportEmoji={sportEmoji}
        sportColour={sportColour}
        content={content}
        timeLabel={timeLabel}
        location={location}
        timestamp={timestamp}
        createdAt={createdAt}
        imageUrl={imageUrl}
        likes={likes}
        isLikedByUser={isLikedByUser}
        replies={replies}
        isHotTake={isHotTake}
        metaExtras={metaExtras}
        cardIndex={cardIndex}
        isOwnPost={isOwnPost}
        isLookingToPlay={isLookingToPlay}
        showSpots={showSpots}
        acceptedCount={acceptedCount}
        spotsLeft={spotsLeft}
        pendingCount={pendingCount}
        isFull={isFull}
        userInterestStatus={userInterestStatus}
        isBookmarkedByUser={isBookmarkedByUser}
      />
    );
  }

  return (
    <article
      className="animate-[pf-card-in_500ms_ease-in-out_backwards] border-b border-[rgb(var(--pf-contrast-rgb)/0.04)] px-4 py-4"
      style={{ animationDelay: `${(cardIndex % 8) * 40}ms` }}
    >
      <div className="mb-3.5 flex items-center gap-2">
        {avatarEl}
        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="flex items-center gap-1.5 text-[15px] font-semibold text-[var(--pf-c-ink-f2f5ef)] hover:underline"
          >
            {name}
            {authorPageType && <PageTypeChip type={authorPageType} />}
          </Link>
          <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-xs text-[var(--pf-c-ink-7e8a7e)]">
            {sport && (
              <span className="font-medium" style={{ color: sportColour }}>
                {sportEmoji} {sport}
              </span>
            )}
            {sport && (
              <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
                ·
              </span>
            )}
            <span>{location}</span>
            <span className="text-[var(--pf-c-ink-5a635a)]" aria-hidden>
              ·
            </span>
            <span>{timestamp}</span>
            {metaExtras}
          </p>
        </div>
        {isHotTake && (
          <span className="bg-[#ef9f27]/12 inline-flex shrink-0 items-center gap-1 rounded-md border border-[#ef9f27]/25 px-1.5 py-0.5 text-[12px] font-semibold text-[#EF9F27]">
            <IconFlame className="h-3 w-3" stroke={2} aria-hidden />
            Hot take
          </span>
        )}
        <PostViewerMenu
          postId={postId}
          authorId={authorId}
          authorUsername={username}
          authorName={name}
        />
      </div>

      <p className="mb-3 text-[15px] leading-normal text-[var(--pf-c-ink-f2f5ef)] [word-break:break-word]">
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

      {timeLabel && (
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[var(--pf-c-ink-7e8a7e)]">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 shrink-0" />
            {timeLabel}
          </span>
        </div>
      )}

      {sendDialogOpen && (
        <SendPostDialog postId={postId} onOpenChange={setSendDialogOpen} />
      )}
    </article>
  );
}
