"use client";

import { FeedCardComments } from "@/components/playfinder/feed-card-comments";
import { FeedCardImInButton } from "@/components/playfinder/feed-card-im-in-button";
import { FeedCardLikeButton } from "@/components/playfinder/feed-card-like-button";
import { FeedCardMessageClubButton } from "@/components/playfinder/feed-card-message-club-button";
import { FeedCardShareButton } from "@/components/playfinder/feed-card-share-button";
import {
  Clock,
  MapPin,
  BadgeCheck,
} from "lucide-react";
import { isLookingToPlayIntent } from "@/lib/playfinder";
import Link from "next/link";

type CardType = "looking" | "recruiting" | "banter";

interface PlayerSlot {
  filled: boolean;
  avatar?: string;
}

export interface FeedCardProps {
  postId: string;
  authorId: string;
  username: string;
  type: CardType;
  /** Raw post intent from API (for robust LOOKING_TO_PLAY detection) */
  intent?: string;
  avatar: string;
  name: string;
  timestamp: string;
  location: string;
  sport?: string;
  content: string;
  isVerified?: boolean;
  isUrgent?: boolean;
  playerSlots?: PlayerSlot[];
  slotsRemaining?: number;
  timeChip?: string;
  locationChip?: string;
  skillLevel?: string;
  expiresIn?: string;
  expiryPercent?: number;
  likes?: number;
  isLikedByUser?: boolean;
  tags?: string[];
  replies?: number;
  /** Hide actions and comments — used on profile post list */
  compact?: boolean;
}

const cardAccentColors: Record<CardType, string> = {
  looking: "#C9F31D",
  recruiting: "#3B82F6",
  banter: "#EAB308",
};

const intentBadges: Record<CardType, { label: string; color: string }> = {
  looking: { label: "Looking to Play", color: "bg-[#C9F31D] text-black" },
  recruiting: { label: "Recruiting", color: "bg-[#3B82F6] text-white" },
  banter: { label: "Banter", color: "bg-[#EAB308] text-black" },
};

export function FeedCard({
  postId,
  authorId,
  username,
  type,
  intent,
  avatar,
  name,
  timestamp,
  location,
  sport,
  content,
  isVerified = false,
  isUrgent = false,
  playerSlots = [],
  slotsRemaining = 0,
  timeChip,
  locationChip,
  skillLevel,
  expiresIn,
  expiryPercent = 100,
  likes = 0,
  isLikedByUser = false,
  tags = [],
  replies = 0,
  compact = false,
}: FeedCardProps) {
  const likeState = { likes, isLikedByUser };
  const profileHref = `/users/${username}`;
  const isLooking =
    isLookingToPlayIntent(intent) || (intent == null && type === "looking");

  return (
    <div className="overflow-hidden rounded-xl bg-[#1a1a1a]">
      <div
        className="h-[3px]"
        style={{ backgroundColor: cardAccentColors[type] }}
      />

      <div className="p-4">
        <div className="mb-3 flex items-start justify-between">
          <Link
            href={profileHref}
            className="flex min-w-0 items-center gap-3 transition-opacity hover:opacity-80"
          >
            {avatar.startsWith("http") ? (
              <img
                src={avatar}
                alt=""
                className="h-10 w-10 flex-shrink-0 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-sm font-bold text-white">
                {avatar}
              </div>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="truncate font-semibold text-white">{name}</span>
                {isVerified && (
                  <BadgeCheck className="h-4 w-4 flex-shrink-0 fill-[#3B82F6] text-[#3B82F6]" />
                )}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>{timestamp}</span>
                <span>·</span>
                <span>{location}</span>
              </div>
            </div>
          </Link>

          <div className="flex flex-shrink-0 items-center gap-2">
            {isUrgent && (
              <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-medium text-white">
                Urgent
              </span>
            )}
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-medium ${intentBadges[type].color}`}
            >
              {intentBadges[type].label}
            </span>
          </div>
        </div>

        {sport && (
          <span className="mb-3 inline-block rounded bg-[#2a2a2a] px-2 py-0.5 text-xs text-muted-foreground">
            {sport}
          </span>
        )}

        {isLooking && playerSlots.length > 0 && (
          <div className="mb-3 flex items-center gap-3">
            <div className="flex -space-x-1 items-center">
              {playerSlots.map((slot, i) => (
                <div
                  key={i}
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold ${
                    slot.filled
                      ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                      : "border-dashed border-muted-foreground bg-transparent"
                  }`}
                >
                  {slot.filled && "✓"}
                </div>
              ))}
            </div>
            <span className="text-sm font-medium text-[#C9F31D]">
              {slotsRemaining} spot{slotsRemaining !== 1 ? "s" : ""} left
            </span>
          </div>
        )}

        <p className="mb-3 text-sm leading-relaxed text-white">{content}</p>

        {!compact && isLooking && (
          <div className="mb-3">
            <FeedCardImInButton
              fullWidth
              authorId={authorId}
              sport={sport}
              location={locationChip ?? location}
              timeLabel={timeChip}
            />
          </div>
        )}

        {isLooking && (timeChip || locationChip || skillLevel) && (
          <div className="mb-3 flex flex-wrap gap-2">
            {timeChip && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-[#1f1f1f] px-2.5 py-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                {timeChip}
              </span>
            )}
            {locationChip && (
              <span className="flex items-center gap-1 rounded-full border border-border bg-[#1f1f1f] px-2.5 py-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />
                {locationChip}
              </span>
            )}
            {skillLevel && (
              <span className="rounded-full border border-border bg-[#1f1f1f] px-2.5 py-1 text-xs text-muted-foreground">
                ⭐ {skillLevel}
              </span>
            )}
          </div>
        )}

        {tags.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-full border border-border bg-[#1f1f1f] px-2.5 py-1 text-xs text-muted-foreground"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {isLooking && expiresIn && (
          <div className="mb-4">
            <div className="mb-1 flex items-center justify-between text-xs text-muted-foreground">
              <span>Expires in {expiresIn}</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-[#2a2a2a]">
              <div
                className="h-full rounded-full bg-[#C9F31D] transition-all"
                style={{ width: `${expiryPercent}%` }}
              />
            </div>
          </div>
        )}

        {!compact && (
          <>
            <div className="space-y-3 border-t border-border pt-3">
              {type === "recruiting" && (
                <FeedCardMessageClubButton
                  fullWidth
                  authorId={authorId}
                  clubName={name}
                />
              )}

              <div className="flex items-center gap-4">
                <FeedCardLikeButton postId={postId} initialState={likeState} />
                <FeedCardShareButton postId={postId} />
              </div>
            </div>

            <FeedCardComments postId={postId} initialReplyCount={replies} />
          </>
        )}
      </div>
    </div>
  );
}
