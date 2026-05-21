import {
  AthleteProfileData,
  AthleteSport,
} from "@/components/playfinder-profile/types";
import { UserData } from "@/lib/types";
import { formatDate } from "date-fns";

const PLACEHOLDER_SPORTS: AthleteSport[] = [
  { emoji: "⚽", name: "Football", tier: "Intermediate", detail: null },
  { emoji: "🎾", name: "Tennis", tier: "Beginner", detail: null },
  { emoji: "🏋️", name: "Gym", tier: "Intermediate", detail: null },
];

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function buildAthleteProfileData(
  user: UserData,
  loggedInUserId: string,
): AthleteProfileData {
  return {
    userId: user.id,
    username: user.username,
    initials: getInitials(user.displayName),
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    region: "Greater Glasgow",
    location: "Glasgow",
    joinedDate: `joined ${formatDate(user.createdAt, "MMM yyyy")}`,
    isOnline: true,
    intent: "Looking for players and games nearby",
    bio: user.bio,
    isOwnProfile: user.id === loggedInUserId,
    stats: {
      gamesPlayed: 0,
      reliability: 4.8,
      connections: user._count.followers,
      broadcasts: user._count.posts,
    },
    sports: PLACEHOLDER_SPORTS,
  };
}
