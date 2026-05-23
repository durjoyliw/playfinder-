"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import type { HomeFeedCardProps } from "@/lib/home-feed-card";
import { cn } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const ACTION_PILL =
  "flex flex-1 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#1f1f1f] py-[9px] text-center text-[13px] transition-colors";

export function HomeFeedCard({
  postId,
  authorId,
  username,
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
  cardIndex = 0,
}: HomeFeedCardProps) {
  const { user } = useSession();
  const router = useRouter();
  const profileHref = `/users/${username}`;
  const hasPhoto = avatar.startsWith("http");
  const voltAvatar = cardIndex % 2 === 0;
  const isOwnPost = user.id === authorId;

  const handleImIn = () => {
    if (isOwnPost) return;
    const sportLabel = sport ?? "your game";
    const draft = `I'm in! 👋 Saw your post about ${sportLabel} — still need players?`;
    router.push(
      `/messages?to=${encodeURIComponent(authorId)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  return (
    <article className="mx-3 mb-3 overflow-hidden rounded-2xl border border-[#1f1f1f] bg-[#161616] p-4">
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

        <div className="min-w-0 flex-1">
          <Link
            href={profileHref}
            className="text-[15px] font-bold leading-tight text-white hover:underline"
          >
            {name}
          </Link>
          <p className="mt-0.5 text-xs leading-snug text-[#888888]">
            <span>{timestamp}</span>
            <span> · </span>
            <span>{location}</span>
            {sport && (
              <>
                <span> · </span>
                <span className="font-semibold text-[#C9F31D]">{sport}</span>
              </>
            )}
          </p>
        </div>
      </div>

      <p className="mb-3.5 mt-2.5 text-sm leading-[1.6] text-white">{content}</p>

      {imageUrl && (
        <Link href={`/posts/${postId}`} className="mb-3.5 block">
          <img
            src={imageUrl}
            alt=""
            className="max-h-80 w-full rounded-xl object-cover"
          />
        </Link>
      )}

      <div className="flex w-full items-center gap-2">
        <div className="flex min-w-0 flex-1 gap-2">
          {showImInButton && !isOwnPost && (
            <button
              type="button"
              onClick={handleImIn}
              className={cn(ACTION_PILL, "font-bold text-white")}
            >
              I&apos;m in 👋
            </button>
          )}
          <FeedCardLikeButton
            postId={postId}
            initialState={{ likes, isLikedByUser }}
            pill
          />
          <Link
            href={`/posts/${postId}`}
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
