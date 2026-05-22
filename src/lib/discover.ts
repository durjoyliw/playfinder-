import { ProfileIntent, Sport } from "@prisma/client";

export const DISCOVER_SPORT_FILTERS = [
  { id: "all", label: "All", sport: null },
  { id: "football", label: "Football", sport: Sport.FOOTBALL },
  { id: "tennis", label: "Tennis", sport: Sport.TENNIS },
  { id: "basketball", label: "Basketball", sport: Sport.BASKETBALL },
  { id: "gym", label: "Gym", sport: Sport.GYM },
  { id: "running", label: "Running", sport: Sport.RUNNING },
  { id: "swimming", label: "Swimming", sport: Sport.SWIMMING },
  { id: "squash", label: "Squash", sport: Sport.SQUASH },
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
  sports: { sport: Sport; skillLevel: string }[];
}
