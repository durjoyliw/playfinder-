"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import {
  formatSportLabel,
  intentToCardType,
  isLookingToPlayIntent,
} from "@/lib/playfinder";
import { getInitials, SKILL_LEVEL_OPTIONS } from "@/lib/settings";
import { getSportByEnum } from "@/lib/sports";
import { PostData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface SearchGameCardProps {
  post: PostData;
}

const intentBadgeStyles: Record<
  ReturnType<typeof intentToCardType>,
  string
> = {
  looking: "bg-[#C9F31D] text-black",
  recruiting: "bg-[#3B82F6] text-white",
  banter: "bg-[#EAB308] text-black",
};

const intentLabels: Record<ReturnType<typeof intentToCardType>, string> = {
  looking: "Looking to Play",
  recruiting: "Recruiting",
  banter: "Banter",
};

function getAuthorSkill(post: PostData): string | undefined {
  if (!post.sport) return undefined;
  const sportKey = getSportByEnum(post.sport)?.id;
  if (!sportKey) return undefined;
  const entry = post.user.sports?.find((s) => s.sport === sportKey);
  if (!entry) return undefined;
  return (
    SKILL_LEVEL_OPTIONS.find((o) => o.value === entry.skillLevel)?.label ??
    entry.skillLevel
  );
}

export function SearchGameCard({ post }: SearchGameCardProps) {
  const { user } = useSession();
  const router = useRouter();
  const cardType = intentToCardType(post.intent);
  const isLooking = isLookingToPlayIntent(post.intent);
  const isOwn = user.id === post.user.id;
  const skill = getAuthorSkill(post);
  const sportLabel = formatSportLabel(post.sport);

  const handleImIn = () => {
    if (isOwn) return;
    const sportLabelText = sportLabel ?? "your game";
    const draft = `I'm in! 👋 Saw your post about ${sportLabelText} — still need players?`;
    router.push(
      `/messages?to=${encodeURIComponent(post.user.id)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  return (
    <article className="mx-4 my-2.5 rounded-xl border border-[#222222] bg-[#161616] p-3.5">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-[10px] font-bold",
            intentBadgeStyles[cardType],
          )}
        >
          {sportLabel ?? intentLabels[cardType]}
        </span>
        {isLooking && post.slotsNeeded != null && post.slotsNeeded > 0 && (
          <span className="rounded-full bg-[#2a1a00] px-2.5 py-0.5 text-[10px] font-semibold text-amber-400">
            {post.slotsNeeded} slots left
          </span>
        )}
      </div>

      <p className="font-bold leading-snug text-white">{post.content}</p>

      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-[#666666]">
        {post.location && (
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5" />
            {post.location}
          </span>
        )}
        {post.timeLabel && (
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {post.timeLabel}
          </span>
        )}
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-[10px] font-bold text-black">
          {post.user.avatarUrl ? (
            <img
              src={post.user.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(post.user.displayName)
          )}
        </div>
        <p className="text-xs text-[#666666]">
          {post.user.displayName}
          {skill ? ` · ${skill}` : ""}
        </p>
      </div>

      <div className="mt-3 flex gap-2">
        {!isOwn && (
          <button
            type="button"
            onClick={handleImIn}
            className="flex flex-1 items-center justify-center rounded-full bg-[#C9F31D] py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#d4f73a]"
          >
            I&apos;m in 👋
          </button>
        )}
        <Link
          href={`/posts/${post.id}`}
          className={cn(
            "flex flex-1 items-center justify-center rounded-full bg-[#1f1f1f] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2a2a2a]",
            isOwn && "flex-1",
          )}
        >
          View post
        </Link>
      </div>
    </article>
  );
}
