import {
  AthleteProfileData,
  AthleteSport,
  SkillTier,
} from "@/components/playfinder-profile/types";
import { getSportDisplay } from "@/lib/onboarding-sports";
import { SKILL_LEVEL_OPTIONS } from "@/lib/settings";
import { UserProfileData } from "@/lib/types";
import { ProfileIntent, SkillLevel } from "@prisma/client";
import { formatDate } from "date-fns";

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function skillLevelToTier(skillLevel: SkillLevel): SkillTier {
  const label = SKILL_LEVEL_OPTIONS.find((l) => l.value === skillLevel)?.label;
  return (label as SkillTier) ?? "Intermediate";
}

function mapUserSports(
  sports: UserProfileData["sports"],
): AthleteSport[] {
  return sports.map((entry) => {
    const display = getSportDisplay(entry.sport);
    return {
      emoji: display.emoji,
      name: display.name,
      tier: skillLevelToTier(entry.skillLevel),
      detail: null,
    };
  });
}

function formatProfileLocation(raw: string | null | undefined): string | null {
  const value = raw?.trim();
  if (!value) return null;

  const parts = value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);

  const firstPart = parts[0] ?? value;

  // UK-style postcode detection (e.g. "G42 8RT", "SW1A 1AA").
  const postcodeMatch = value.match(
    /\b([A-Z]{1,2}\d[A-Z\d]?\s?\d[A-Z]{2})\b/i,
  );

  if (!postcodeMatch) return firstPart;

  const postcode = postcodeMatch[1].toUpperCase().replace(/\s+/, " ");
  const partWithPostcodeIdx = parts.findIndex((p) => /[A-Z]{1,2}\d/i.test(p));

  let area =
    partWithPostcodeIdx === 0 ? (parts[1] ?? null) : (parts[0] ?? null);

  if (area) {
    area = area.replace(new RegExp(postcodeMatch[1], "i"), "").trim();
    if (!area) area = null;
  }

  return area ? `${area}, ${postcode}` : postcode;
}

export interface ProfileStats {
  games: number;
  broadcasts: number;
  teammates: number;
}

export function buildAthleteProfileData(
  user: UserProfileData,
  loggedInUserId: string,
  stats: ProfileStats,
): AthleteProfileData {
  const location = formatProfileLocation(user.location) ?? null;

  return {
    userId: user.id,
    username: user.username,
    initials: getInitials(user.displayName),
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    region: location ?? "Greater Glasgow",
    location: location ?? "Location not set",
    joinedDate: `joined ${formatDate(user.createdAt, "MMM yyyy")}`,
    isOnline: true,
    bio: user.bio,
    isOwnProfile: user.id === loggedInUserId,
    profileIntent: user.profileIntent ?? ProfileIntent.LOOKING_TO_PLAY,
    stats: {
      games: stats.games,
      broadcasts: stats.broadcasts,
      teammates: stats.teammates,
    },
    sports: mapUserSports(user.sports),
  };
}
