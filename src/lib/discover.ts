import { ProfileIntent } from "@prisma/client";

/** Tab id matches UserSport.sport string keys (e.g. football, tennis) */
export const DISCOVER_SPORT_FILTERS = [
  { id: "all", label: "All", sportKey: null },
  { id: "football", label: "Football", sportKey: "football" },
  { id: "tennis", label: "Tennis", sportKey: "tennis" },
  { id: "basketball", label: "Basketball", sportKey: "basketball" },
  { id: "gym", label: "Gym", sportKey: "gym" },
  { id: "running", label: "Running", sportKey: "running" },
  { id: "swimming", label: "Swimming", sportKey: "swimming" },
  { id: "squash", label: "Squash", sportKey: "squash" },
] as const;

export type DiscoverSportFilterId =
  (typeof DISCOVER_SPORT_FILTERS)[number]["id"];

export interface DiscoverPlayer {
  id: string;
  displayName: string;
  username: string;
  avatarUrl: string | null;
  location: string | null;
  profileIntent: ProfileIntent | null;
  sports: { sport: string; skillLevel: string }[];
}
