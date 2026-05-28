import { normalizeSportKey } from "@/lib/onboarding-sports";
import { PLAYFINDER_SPORTS, getSportById } from "@/lib/sports";
import { computeInterestFields } from "@/lib/post-interest";
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

/** Maps feed tab id → Post.sport enum (normalises UserSport keys and enum casing). */
export function sportTabToPostSport(tabId: string): Sport | undefined {
  if (!tabId || tabId === "all") return undefined;

  const key = normalizeSportKey(tabId);
  const fromCatalog = getSportById(key)?.enum;
  if (fromCatalog) return fromCatalog;

  const enumEntry = Object.entries(Sport).find(
    ([, value]) => normalizeSportKey(value) === key,
  );
  return enumEntry ? (enumEntry[1] as Sport) : undefined;
}

export function formatSportLabel(sport: Sport | null | undefined): string | undefined {
  if (!sport) return undefined;
  return PLAYFINDER_SPORTS.find((s) => s.enum === sport)?.label ?? sport;
}

export function getPostTypeBadge(postType: string | null) {
  const isArena = postType === "ARENA" || postType === "BROADCAST";
  return {
    label: isArena ? "Arena" : "Social",
    style: {
      background: isArena ? "rgba(201,243,29,0.1)" : "rgba(55,138,221,0.12)",
      border: isArena
        ? "1px solid rgba(201,243,29,0.25)"
        : "1px solid rgba(55,138,221,0.25)",
      color: isArena ? "#C9F31D" : "#378ADD",
      fontSize: "11px",
      fontWeight: 700,
      borderRadius: "5px",
      padding: "3px 8px",
    },
  };
}

/** True for LOOKING_TO_PLAY regardless of enum/string casing */
export function isLookingToPlayIntent(intent: unknown): boolean {
  if (intent == null) return false;
  const normalized = String(intent).toLowerCase().replace(/-/g, "_");
  return (
    normalized === "looking_to_play" ||
    normalized === "lookingtoplay" ||
    intent === PostIntent.LOOKING_TO_PLAY
  );
}

export function intentToCardType(
  intent: PostIntent | string,
): FeedCardProps["type"] {
  if (isLookingToPlayIntent(intent)) return "looking";
  const normalized = String(intent).toLowerCase().replace(/-/g, "_");
  if (normalized === "recruiting" || intent === PostIntent.RECRUITING) {
    return "recruiting";
  }
  return "banter";
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

const LISTING_EXPIRY_MS = 24 * 60 * 60 * 1000;

/** Feed listing TTL — not the scheduled game time (that lives in timeLabel). */
export function getListingExpiresAt(intent: PostIntent): Date | null {
  if (intent === PostIntent.LOOKING_TO_PLAY) {
    return new Date(Date.now() + LISTING_EXPIRY_MS);
  }
  return null;
}

export function toPostDate(
  value: Date | string | null | undefined,
): Date | null {
  if (value == null) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

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

function getExpiryInfo(
  expiresAt: Date | string | null | undefined,
  createdAt: Date | string,
) {
  const expiresAtDate = toPostDate(expiresAt);
  const createdAtDate = toPostDate(createdAt) ?? new Date();

  if (!expiresAtDate) {
    return { expiresIn: undefined, expiryPercent: undefined };
  }

  const now = new Date();
  const remainingMs = differenceInMilliseconds(expiresAtDate, now);

  if (remainingMs <= 0) {
    return { expiresIn: undefined, expiryPercent: undefined };
  }

  const totalMs = differenceInMilliseconds(expiresAtDate, createdAtDate);
  const expiryPercent =
    totalMs > 0 ? Math.max(0, Math.min(100, (remainingMs / totalMs) * 100)) : 0;

  return {
    expiresIn: formatExpiresInLabel(remainingMs),
    expiryPercent: Math.round(expiryPercent),
  };
}

export function mapPostToFeedCard(
  post: PostData,
  loggedInUserId?: string,
): FeedCardProps {
  const isLookingToPlay = isLookingToPlayIntent(post.intent);

  const { expiresIn, expiryPercent } = isLookingToPlay
    ? getExpiryInfo(post.expiresAt, post.createdAt)
    : { expiresIn: undefined, expiryPercent: undefined };

  const now = new Date();
  const expiresAtDate = toPostDate(post.expiresAt);
  const isUrgent =
    isLookingToPlay &&
    !!expiresAtDate &&
    expiresAtDate > now &&
    differenceInMilliseconds(expiresAtDate, now) < TWO_HOURS_MS;

  const interestFields = computeInterestFields(
    post,
    loggedInUserId ?? "",
  );
  const isArenaPost =
    post.type === "ARENA" || post.type === "BROADCAST";
  const showSpots =
    isArenaPost && post.slotsNeeded != null && post.slotsNeeded > 0;

  return {
    postId: post.id,
    authorId: post.user.id,
    username: post.user.username,
    type: intentToCardType(post.intent),
    intent: String(post.intent),
    postType: post.type ?? null,
    avatar: post.user.avatarUrl ?? getInitials(post.user.displayName),
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
    slotsRemaining: showSpots ? interestFields.spotsLeft : undefined,
    acceptedCount: showSpots ? interestFields.acceptedCount : undefined,
    isFull: interestFields.isFull,
    userInterestStatus: interestFields.userInterestStatus,
    playerSlots: [],
  };
}

export function sortPlayfinderPosts(posts: PostData[]): PostData[] {
  const now = new Date();

  return [...posts].sort((a, b) => {
    const aExpiresAt = toPostDate(a.expiresAt);
    const bExpiresAt = toPostDate(b.expiresAt);
    const aPinned =
      isLookingToPlayIntent(a.intent) &&
      (!aExpiresAt || aExpiresAt > now);
    const bPinned =
      isLookingToPlayIntent(b.intent) &&
      (!bExpiresAt || bExpiresAt > now);

    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;

    return b.createdAt.getTime() - a.createdAt.getTime();
  });
}

export function filterActivePlayfinderPosts(posts: PostData[]): PostData[] {
  const now = new Date();
  return posts.filter((post) => {
    if (!isLookingToPlayIntent(post.intent)) return true;
    const expiresAt = toPostDate(post.expiresAt);
    return !expiresAt || expiresAt > now;
  });
}
