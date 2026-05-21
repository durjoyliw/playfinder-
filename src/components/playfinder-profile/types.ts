export type SkillTier = "Advanced" | "Intermediate" | "Beginner";

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
  intent: string;
  bio: string | null;
  isOwnProfile: boolean;
  stats: {
    gamesPlayed: number;
    reliability: number;
    connections: number;
    broadcasts: number;
  };
  sports: AthleteSport[];
}
