"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import type { HomeFeedCardProps } from "@/lib/home-feed-card";
import { isLookingToPlayIntent } from "@/lib/playfinder";
import { cn } from "@/lib/utils";
import { IconBolt, IconCheck, IconFlame, IconLock } from "@tabler/icons-react";
import { Clock, MapPin } from "lucide-react";
import Link from "next/link";

const ACTION_PILL =
  "flex flex-1 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#1f1f1f] py-[9px] text-center text-[13px] transition-colors";

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
  const profileHref = `/users/${username}`;
  const hasPhoto = avatar.startsWith("http");
  const voltAvatar = cardIndex % 2 === 0;
  const isOwnPost = user.id === authorId;
  const isLookingToPlay = isLookingToPlayIntent(intent);
  const tabParam = fromTab ?? "social";
  const postHref = `/posts/${postId}?tab=${tabParam}`;
  const isArenaPost = postType === "ARENA" || postType === "BROADCAST";
  const showSpots =
    isArenaPost && (acceptedCount > 0 || spotsLeft > 0);

  return (
    <article
      className={cn(
        "relative mx-3 mb-3 overflow-hidden rounded-2xl bg-[#161616] p-4",
        isTeammate
          ? "border border-[rgba(201,243,29,0.22)]"
          : "border border-[#252525]",
      )}
    >
      {isHotTake && (
        <span
          className="absolute right-4 top-4 inline-flex items-center gap-1 font-bold"
          style={{
            background: "rgba(239,159,39,0.12)",
            border: "1px solid rgba(239,159,39,0.25)",
            color: "#EF9F27",
            fontSize: 10,
            borderRadius: 5,
            padding: "3px 6px",
          }}
        >
          <IconFlame className="h-3 w-3" stroke={2} aria-hidden />
          HOT TAKE
        </span>
      )}

      <div className="flex items-start gap-3">
        <Link href={profileHref} className="flex-shrink-0">
          {hasPhoto ? (
            <img
              src={avatar}
              alt=""
              className="h-11 w-11 rounded-full object-cover"
            />
          ) : (
            <div
              className={cn(
                "flex h-11 w-11 items-center justify-center rounded-full text-sm font-bold",
                voltAvatar
                  ? "bg-[#C9F31D] text-black"
                  : "bg-[#2a2a2a] text-[#888888]",
              )}
            >
              {avatar}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1 pr-16">
          <Link
            href={profileHref}
            className="text-[15px] font-bold leading-tight text-white hover:underline"
          >
            {name}
          </Link>
          <p className="mt-0.5 flex flex-wrap items-center gap-x-1 text-xs leading-snug">
            <span className="text-[#555555]">{timestamp}</span>
            <span className="text-[#444444]" aria-hidden>
              ·
            </span>
            <span className="text-[#555555]">{location}</span>
            {isTeammate && (
              <>
                <span className="text-[#444444]" aria-hidden>
                  ·
                </span>
                <span
                  className="inline-flex items-center gap-0.5 font-medium"
                  style={{ color: "rgba(201, 243, 29, 0.55)" }}
                >
                  <IconBolt className="h-3 w-3" stroke={2} aria-hidden />
                  Teammate
                </span>
              </>
            )}
            {visibility === "TEAMMATES_ONLY" && (
              <>
                <span className="text-[#444444]" aria-hidden>
                  ·
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] text-[#555555]">
                  <IconLock className="h-3 w-3" stroke={1.75} aria-hidden />
                  Teammates only
                </span>
              </>
            )}
            {sport && (
              <>
                <span className="text-[#444444]" aria-hidden>
                  ·
                </span>
                <span
                  className="inline-flex items-center"
                  style={{
                    background: "transparent",
                    border: "1px solid #333",
                    color: "#888",
                    fontSize: 11,
                    padding: "2px 8px",
                    borderRadius: 5,
                  }}
                >
                  {sport}
                </span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="mb-3.5 mt-2.5 text-sm leading-[1.6] text-white">{content}</p>

      {showSpots && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            margin: "8px 0",
          }}
        >
          {Array.from({ length: acceptedCount }).map((_, i) => (
            <div
              key={`filled-${i}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px solid #C9F31D",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "transparent",
              }}
            >
              <IconCheck size={14} color="#C9F31D" stroke={2.5} />
            </div>
          ))}
          {Array.from({ length: spotsLeft }).map((_, i) => (
            <div
              key={`empty-${i}`}
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                border: "2px dashed #444",
                background: "transparent",
              }}
            />
          ))}
          <span style={{ fontSize: 13, color: "#C9F31D", fontWeight: 600 }}>
            {spotsLeft > 0
              ? `${spotsLeft} spot${spotsLeft > 1 ? "s" : ""} left`
              : "Full"}
          </span>
        </div>
      )}

      {imageUrl && (
        <Link href={postHref} className="mb-3.5 block">
          <img
            src={imageUrl}
            alt=""
            className="max-h-80 w-full rounded-xl object-cover"
          />
        </Link>
      )}

      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-2">
          {showImInButton && isLookingToPlay && !isOwnPost && (
            <div className="min-w-0 flex-1">
              <FeedCardImInButton
                postId={postId}
                authorId={authorId}
                isFull={isFull}
                userInterestStatus={userInterestStatus}
                fullWidth
              />
            </div>
          )}
          <FeedCardLikeButton
            postId={postId}
            initialState={{ likes, isLikedByUser }}
            pill
          />
          <Link
            href={postHref}
            className={cn(ACTION_PILL, "text-[#888888] hover:text-white")}
            aria-label="View comments"
          >
            💬 {replies}
          </Link>
        </div>
        <FeedCardShareButton
          postId={postId}
          iconOnly
          className="ml-1 flex-shrink-0 p-1 text-[#888888] hover:text-white"
        />
      </div>

      {(timeLabel || location) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-[#555555]">
          {timeLabel && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 flex-shrink-0" />
              {timeLabel}
            </span>
          )}
          {location && (
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {location}
            </span>
          )}
        </div>
      )}
    </article>
  );
}
