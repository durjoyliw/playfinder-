import { PLAYFINDER_SPORTS, getSportById } from "@/lib/sports";
import { PostData } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import { PostIntent, Sport } from "@prisma/client";
import { differenceInMilliseconds } from "date-fns";
import type { FeedCardProps } from "@/components/playfinder/feed-card";

export { PLAYFINDER_SPORTS } from "@/lib/sports";

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
  return getSportById(tabId)?.enum;
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

const TWO_HOURS_MS = 2 * 60 * 60 * 1000;

export function formatExpiresInLabel(remainingMs: number): string {
  const totalMinutes = Math.max(1, Math.ceil(remainingMs / (60 * 1000)));

  if (totalMinutes < 60) {
    return `${totalMinutes}m`;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}m`;
}

function getExpiryInfo(expiresAt: Date | null, createdAt: Date) {
  if (!expiresAt) {
    return { expiresIn: undefined, expiryPercent: undefined };
  }

  const now = new Date();
  const remainingMs = differenceInMilliseconds(expiresAt, now);

  if (remainingMs <= 0) {
    return { expiresIn: undefined, expiryPercent: undefined };
  }

  const totalMs = differenceInMilliseconds(expiresAt, createdAt);
  const expiryPercent =
    totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;

  return {
    expiresIn: formatExpiresInLabel(remainingMs),
    expiryPercent: Math.round(expiryPercent),
  };
}

export function mapPostToFeedCard(post: PostData): FeedCardProps {
  const isLookingToPlay = post.intent === PostIntent.LOOKING_TO_PLAY;

  const { expiresIn, expiryPercent } = isLookingToPlay
    ? getExpiryInfo(post.expiresAt, post.createdAt)
    : { expiresIn: undefined, expiryPercent: undefined };

  const now = new Date();
  const isUrgent =
    isLookingToPlay &&
    !!post.expiresAt &&
    post.expiresAt > now &&
    differenceInMilliseconds(post.expiresAt, now) < TWO_HOURS_MS;

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
