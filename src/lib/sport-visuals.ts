import { normalizeSportKey } from "@/lib/onboarding-sports";

/** Bolt reference sport colours */
const SPORT_COLOURS: Record<string, string> = {
  basketball: "#ff8a4c",
  football: "#4ee0a0",
  gym: "#ff6b6b",
  polo: "#b08aff",
  tennis: "#b0bf48",
  running: "#56ccf2",
  swimming: "#56ccf2",
  rugby: "#4ee0a0",
  cricket: "#ff8a4c",
  boxing: "#ff6b6b",
  cycling: "#56ccf2",
  volleyball: "#ff8a4c",
  golf: "#4ee0a0",
  squash: "#b0bf48",
  badminton: "#b0bf48",
};

const DEFAULT_SPORT_COLOUR = "#56ccf2";

export function getSportColour(sport: string | null | undefined): string {
  if (!sport) return DEFAULT_SPORT_COLOUR;
  const key = normalizeSportKey(sport);
  return SPORT_COLOURS[key] ?? DEFAULT_SPORT_COLOUR;
}
