import {
  AthleteProfileData,
  AthleteSport,
  SkillTier,
} from "@/components/playfinder-profile/types";
import { getSportEmoji, getSportLabel } from "@/lib/sports";
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
  return sports.map((entry) => ({
    emoji: getSportEmoji(entry.sport),
    name: getSportLabel(entry.sport),
    tier: skillLevelToTier(entry.skillLevel),
    detail: null,
  }));
}

export interface ProfileStats {
  games: number;
  broadcasts: number;
}

export function buildAthleteProfileData(
  user: UserProfileData,
  loggedInUserId: string,
  stats: ProfileStats,
): AthleteProfileData {
  const location = user.location?.trim() || null;

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
    },
    sports: mapUserSports(user.sports),
  };
}
