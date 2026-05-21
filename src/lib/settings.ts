import { PLAYFINDER_SPORTS } from "@/lib/sports";
import { ProfileIntent, SkillLevel, Sport } from "@prisma/client";

export const PROFILE_INTENT_OPTIONS = [
  {
    value: ProfileIntent.LOOKING_TO_PLAY,
    label: "Looking to Play",
    className: "border-[#C9F31D] bg-[#C9F31D]/15 text-[#C9F31D]",
    activeClassName: "bg-[#C9F31D] text-black",
  },
  {
    value: ProfileIntent.JOIN_A_TEAM,
    label: "Join a Team",
    className: "border-[#3B82F6] bg-[#3B82F6]/15 text-[#3B82F6]",
    activeClassName: "bg-[#3B82F6] text-white",
  },
  {
    value: ProfileIntent.JUST_VIBES,
    label: "Just Vibes",
    className: "border-[#EAB308] bg-[#EAB308]/15 text-[#EAB308]",
    activeClassName: "bg-[#EAB308] text-black",
  },
] as const;

export const PROFILE_INTENT_PROFILE_OPTIONS = [
  {
    value: ProfileIntent.LOOKING_TO_PLAY,
    emoji: "🟢",
    label: "Looking to Play",
    description: "find casual games and partners",
    pillClassName:
      "border-[#C9F31D]/30 bg-[#C9F31D]/10 text-[#C9F31D] hover:bg-[#C9F31D]/20",
    dotClassName: "bg-[#C9F31D]",
  },
  {
    value: ProfileIntent.JOIN_A_TEAM,
    emoji: "🔵",
    label: "Join a Team",
    description: "looking for a competitive team or club",
    pillClassName:
      "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6] hover:bg-[#3B82F6]/20",
    dotClassName: "bg-[#3B82F6]",
  },
  {
    value: ProfileIntent.JUST_VIBES,
    emoji: "🟡",
    label: "Just Vibes",
    description: "here for banter and community",
    pillClassName:
      "border-[#EAB308]/30 bg-[#EAB308]/10 text-[#EAB308] hover:bg-[#EAB308]/20",
    dotClassName: "bg-[#EAB308]",
  },
] as const;

export function getProfileIntentDisplay(intent: ProfileIntent | null) {
  const resolved = intent ?? ProfileIntent.LOOKING_TO_PLAY;
  const option =
    PROFILE_INTENT_PROFILE_OPTIONS.find((o) => o.value === resolved) ??
    PROFILE_INTENT_PROFILE_OPTIONS[0];

  return {
    ...option,
    summary: `${option.label} — ${option.description}`,
  };
}

export const SETTINGS_SPORTS = PLAYFINDER_SPORTS.map((sport) => ({
  value: sport.enum,
  label: sport.label,
}));

export const SKILL_LEVEL_OPTIONS = [
  { value: SkillLevel.BEGINNER, label: "Beginner" },
  { value: SkillLevel.INTERMEDIATE, label: "Intermediate" },
  { value: SkillLevel.ADVANCED, label: "Advanced" },
  { value: SkillLevel.PRO, label: "Pro" },
] as const;

export interface UserSportEntry {
  sport: Sport;
  skillLevel: SkillLevel;
}

export interface UserSettingsData {
  username: string;
  displayName: string;
  bio: string | null;
  location: string | null;
  profileIntent: ProfileIntent | null;
  email: string | null;
  sports: UserSportEntry[];
}

export function getProfileIntentLabel(intent: ProfileIntent | null): string {
  if (!intent) return "Not set";
  return (
    PROFILE_INTENT_OPTIONS.find((option) => option.value === intent)?.label ??
    "Not set"
  );
}

export function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
