import { ProfileIntent, SkillLevel, Sport } from "@prisma/client";

export type SkillTier = "Advanced" | "Intermediate" | "Beginner" | "Pro";

export interface AthleteSport {
  emoji: string;
  name: string;
  tier: SkillTier;
  detail: string | null;
}

export interface AthleteProfileData {
  userId: string;
  username: string;
  initials: string;
  displayName: string;
  avatarUrl: string | null;
  region: string;
  location: string;
  joinedDate: string;
  isOnline: boolean;
  bio: string | null;
  isOwnProfile: boolean;
  profileIntent: ProfileIntent | null;
  stats: {
    games: number;
    broadcasts: number;
  };
  sports: AthleteSport[];
}
