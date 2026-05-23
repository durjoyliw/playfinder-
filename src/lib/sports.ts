import { getSportDisplay } from "@/lib/onboarding-sports";
import { Sport } from "@prisma/client";

export const PLAYFINDER_SPORTS = [
  { id: "football", label: "Football", emoji: "⚽", enum: Sport.FOOTBALL },
  { id: "tennis", label: "Tennis", emoji: "🎾", enum: Sport.TENNIS },
  { id: "basketball", label: "Basketball", emoji: "🏀", enum: Sport.BASKETBALL },
  { id: "gym", label: "Gym", emoji: "🏋️", enum: Sport.GYM },
  { id: "running", label: "Running", emoji: "🏃", enum: Sport.RUNNING },
  { id: "swimming", label: "Swimming", emoji: "🏊", enum: Sport.SWIMMING },
  { id: "squash", label: "Squash", emoji: "🏸", enum: Sport.SQUASH },
  { id: "badminton", label: "Badminton", emoji: "🏸", enum: Sport.BADMINTON },
  { id: "cricket", label: "Cricket", emoji: "🏏", enum: Sport.CRICKET },
  { id: "cycling", label: "Cycling", emoji: "🚴", enum: Sport.CYCLING },
] as const;

export type PlayfinderSport = (typeof PLAYFINDER_SPORTS)[number];

export function getSportByEnum(sport: Sport) {
  return PLAYFINDER_SPORTS.find((s) => s.enum === sport);
}

export function getSportLabel(sport: Sport | string): string {
  if (typeof sport === "string" && !Object.values(Sport).includes(sport as Sport)) {
    return getSportDisplay(sport).name;
  }
  return getSportByEnum(sport as Sport)?.label ?? String(sport);
}

export function getSportEmoji(sport: Sport | string): string {
  if (typeof sport === "string" && !Object.values(Sport).includes(sport as Sport)) {
    return getSportDisplay(sport).emoji;
  }
  return getSportByEnum(sport as Sport)?.emoji ?? "🏅";
}

export function getSportById(id: string) {
  return PLAYFINDER_SPORTS.find((s) => s.id === id);
}
