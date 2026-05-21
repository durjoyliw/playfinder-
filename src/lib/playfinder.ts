import { PostData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { PostIntent, Sport } from "@prisma/client";
import { differenceInMilliseconds, formatDistanceStrict } from "date-fns";
import type { FeedCardProps } from "@/components/playfinder/feed-card";

export const PLAYFINDER_SPORTS = [
  { id: "football", label: "Football", emoji: "⚽", enum: Sport.FOOTBALL },
  { id: "tennis", label: "Tennis", emoji: "🎾", enum: Sport.TENNIS },
  { id: "basketball", label: "Basketball", emoji: "🏀", enum: Sport.BASKETBALL },
  { id: "gym", label: "Gym", emoji: "🏋️", enum: Sport.GYM },
  { id: "running", label: "Running", emoji: "🏃", enum: Sport.RUNNING },
  { id: "swimming", label: "Swimming", emoji: "🏊", enum: Sport.SWIMMING },
  { id: "squash", label: "Squash", emoji: "🏸", enum: Sport.SQUASH },
] as const;

export const SPORT_TABS = [
  { id: "all", label: "All", icon: "⚡" },
  ...PLAYFINDER_SPORTS.map((s) => ({
    id: s.id,
    label: s.label,
    icon: s.emoji,
  })),
];

export const POST_INTENTS = [
  {
    value: PostIntent.LOOKING_TO_PLAY,
    label: "Looking to Play",
    cardType: "looking" as const,
    className: "bg-[#C9F31D] text-black border-[#C9F31D]",
  },
  {
    value: PostIntent.RECRUITING,
    label: "Recruiting",
    cardType: "recruiting" as const,
    className: "bg-[#3B82F6] text-white border-[#3B82F6]",
  },
  {
    value: PostIntent.BANTER,
    label: "Banter",
    cardType: "banter" as const,
    className: "bg-[#EAB308] text-black border-[#EAB308]",
  },
];

export function sportTabToEnum(tabId: string): Sport | undefined {
  return PLAYFINDER_SPORTS.find((s) => s.id === tabId)?.enum;
}

export function formatSportLabel(sport: Sport | null | undefined): string | undefined {
  if (!sport) return undefined;
  return PLAYFINDER_SPORTS.find((s) => s.enum === sport)?.label ?? sport;
}

export function intentToCardType(
  intent: PostIntent,
): FeedCardProps["type"] {
  switch (intent) {
    case PostIntent.LOOKING_TO_PLAY:
      return "looking";
    case PostIntent.RECRUITING:
      return "recruiting";
    default:
      return "banter";
  }
}

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function getExpiryInfo(expiresAt: Date | null, createdAt: Date) {
  if (!expiresAt) return { expiresIn: undefined, expiryPercent: undefined };

  const now = new Date();
  if (expiresAt <= now) {
    return { expiresIn: "Expired", expiryPercent: 0 };
  }

  const totalMs = differenceInMilliseconds(expiresAt, createdAt);
  const remainingMs = differenceInMilliseconds(expiresAt, now);
  const expiryPercent =
    totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;

  return {
    expiresIn: formatDistanceStrict(expiresAt, now),
    expiryPercent: Math.round(expiryPercent),
  };
}

export function mapPostToFeedCard(post: PostData): FeedCardProps {
  const { expiresIn, expiryPercent } = getExpiryInfo(
    post.expiresAt,
    post.createdAt,
  );

  const isUrgent =
    post.intent === PostIntent.LOOKING_TO_PLAY &&
    !!post.expiresAt &&
    post.expiresAt > new Date() &&
    differenceInMilliseconds(post.expiresAt, new Date()) < 60 * 60 * 1000;

  return {
    postId: post.id,
    authorId: post.user.id,
    username: post.user.username,
    type: intentToCardType(post.intent),
    avatar: getInitials(post.user.displayName),
    name: post.user.displayName,
    timestamp: formatRelativeDate(post.createdAt),
    location: post.location ?? "Glasgow",
    sport: formatSportLabel(post.sport),
    content: post.content,
    timeChip: post.timeLabel ?? undefined,
    locationChip: post.location ?? undefined,
    expiresIn,
    expiryPercent,
    isUrgent,
    likes: post._count.likes,
    isLikedByUser: post.likes.length > 0,
    replies: post._count.comments,
  };
}

export function sortPlayfinderPosts(posts: PostData[]): PostData[] {
  const now = new Date();

  return [...posts].sort((a, b) => {
    const aPinned =
      a.intent === PostIntent.LOOKING_TO_PLAY &&
      (!a.expiresAt || a.expiresAt > now);
    const bPinned =
      b.intent === PostIntent.LOOKING_TO_PLAY &&
      (!b.expiresAt || b.expiresAt > now);

    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function filterActivePlayfinderPosts(posts: PostData[]): PostData[] {
  const now = new Date();
  return posts.filter(
    (post) =>
      post.intent !== PostIntent.LOOKING_TO_PLAY ||
      !post.expiresAt ||
      post.expiresAt > now,
  );
}
