/** Full sports catalog for onboarding / profile (stored as string keys on UserSport) */

export interface OnboardingSport {
  id: string;
  name: string;
  emoji: string;
}

export const ONBOARDING_SPORTS: OnboardingSport[] = [
  { id: "football", name: "Football", emoji: "⚽" },
  { id: "tennis", name: "Tennis", emoji: "🎾" },
  { id: "basketball", name: "Basketball", emoji: "🏀" },
  { id: "gym", name: "Gym", emoji: "🏋️" },
  { id: "running", name: "Running", emoji: "🏃" },
  { id: "swimming", name: "Swimming", emoji: "🏊" },
  { id: "rugby", name: "Rugby", emoji: "🏉" },
  { id: "cricket", name: "Cricket", emoji: "🏏" },
  { id: "cycling", name: "Cycling", emoji: "🚴" },
  { id: "badminton", name: "Badminton", emoji: "🏸" },
  { id: "squash", name: "Squash", emoji: "🎾" },
  { id: "golf", name: "Golf", emoji: "⛳" },
  { id: "boxing", name: "Boxing", emoji: "🥊" },
  { id: "martial-arts", name: "Martial Arts", emoji: "🥋" },
  { id: "volleyball", name: "Volleyball", emoji: "🏐" },
  { id: "hockey", name: "Hockey", emoji: "🏑" },
  { id: "table-tennis", name: "Table Tennis", emoji: "🏓" },
  { id: "rowing", name: "Rowing", emoji: "🚣" },
  { id: "climbing", name: "Climbing", emoji: "🧗" },
  { id: "skiing", name: "Skiing", emoji: "⛷️" },
  { id: "snowboarding", name: "Snowboarding", emoji: "🏂" },
  { id: "surfing", name: "Surfing", emoji: "🏄" },
  { id: "skateboarding", name: "Skateboarding", emoji: "🛹" },
  { id: "american-football", name: "American Football", emoji: "🏈" },
  { id: "baseball", name: "Baseball", emoji: "⚾" },
  { id: "softball", name: "Softball", emoji: "⚾" },
  { id: "futsal", name: "Futsal", emoji: "⚽" },
  { id: "handball", name: "Handball", emoji: "🤾" },
  { id: "water-polo", name: "Water Polo", emoji: "🤽" },
  { id: "triathlon", name: "Triathlon", emoji: "🏊" },
  { id: "archery", name: "Archery", emoji: "🏹" },
  { id: "fencing", name: "Fencing", emoji: "🤺" },
  { id: "gymnastics", name: "Gymnastics", emoji: "🤸" },
  { id: "weightlifting", name: "Weightlifting", emoji: "🏋️" },
  { id: "wrestling", name: "Wrestling", emoji: "🤼" },
  { id: "judo", name: "Judo", emoji: "🥋" },
  { id: "karate", name: "Karate", emoji: "🥋" },
  { id: "taekwondo", name: "Taekwondo", emoji: "🥋" },
  { id: "athletics", name: "Athletics", emoji: "🏃" },
  { id: "long-jump", name: "Long Jump", emoji: "🏃" },
  { id: "high-jump", name: "High Jump", emoji: "🏃" },
  { id: "javelin", name: "Javelin", emoji: "🏃" },
  { id: "discus", name: "Discus", emoji: "🏃" },
  { id: "shot-put", name: "Shot Put", emoji: "🏃" },
  { id: "netball", name: "Netball", emoji: "🏐" },
  { id: "lacrosse", name: "Lacrosse", emoji: "🥍" },
  { id: "field-hockey", name: "Field Hockey", emoji: "🏑" },
  { id: "ice-hockey", name: "Ice Hockey", emoji: "🏒" },
  { id: "ice-skating", name: "Ice Skating", emoji: "⛸️" },
  { id: "curling", name: "Curling", emoji: "🥌" },
  { id: "bobsled", name: "Bobsled", emoji: "🛷" },
  { id: "polo", name: "Polo", emoji: "🏇" },
  { id: "horse-riding", name: "Horse Riding", emoji: "🏇" },
  { id: "bowls", name: "Bowls", emoji: "🎳" },
  { id: "bowling", name: "Bowling", emoji: "🎳" },
  { id: "darts", name: "Darts", emoji: "🎯" },
  { id: "snooker", name: "Snooker", emoji: "🎱" },
  { id: "pool", name: "Pool", emoji: "🎱" },
  { id: "paddleboarding", name: "Paddleboarding", emoji: "🏄" },
  { id: "kayaking", name: "Kayaking", emoji: "🚣" },
  { id: "sailing", name: "Sailing", emoji: "⛵" },
  { id: "windsurfing", name: "Windsurfing", emoji: "🏄" },
  { id: "diving", name: "Diving", emoji: "🤿" },
  { id: "cheerleading", name: "Cheerleading", emoji: "📣" },
  { id: "dance", name: "Dance", emoji: "💃" },
  { id: "yoga", name: "Yoga", emoji: "🧘" },
  { id: "pilates", name: "Pilates", emoji: "🧘" },
  { id: "crossfit", name: "CrossFit", emoji: "🏋️" },
  { id: "calisthenics", name: "Calisthenics", emoji: "🤸" },
  { id: "parkour", name: "Parkour", emoji: "🏃" },
  { id: "powerlifting", name: "Powerlifting", emoji: "🏋️" },
  { id: "muay-thai", name: "Muay Thai", emoji: "🥊" },
  { id: "bjj", name: "BJJ", emoji: "🥋" },
  { id: "mma", name: "MMA", emoji: "🥊" },
  { id: "kickboxing", name: "Kickboxing", emoji: "🥊" },
  { id: "capoeira", name: "Capoeira", emoji: "🥋" },
  { id: "floorball", name: "Floorball", emoji: "🏑" },
  { id: "gaelic-football", name: "Gaelic Football", emoji: "🏈" },
  { id: "hurling", name: "Hurling", emoji: "🏑" },
  { id: "shinty", name: "Shinty", emoji: "🏑" },
  { id: "pickleball", name: "Pickleball", emoji: "🏓" },
  { id: "padel", name: "Padel", emoji: "🎾" },
];

export const POPULAR_SPORT_IDS = [
  "tennis",
  "gym",
  "running",
  "basketball",
  "swimming",
] as const;

const sportById = new Map(ONBOARDING_SPORTS.map((s) => [s.id, s]));

export function getOnboardingSport(id: string): OnboardingSport | undefined {
  return sportById.get(id);
}

export function getOnboardingSportLabel(id: string): string {
  return getOnboardingSport(id)?.name ?? id;
}

export function getOnboardingSportEmoji(id: string): string {
  return getOnboardingSport(id)?.emoji ?? "🏅";
}

export function isValidSportKey(id: string): boolean {
  return sportById.has(id);
}

export function filterOnboardingSports(query: string): OnboardingSport[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return ONBOARDING_SPORTS.filter(
    (s) =>
      s.name.toLowerCase().includes(q) || s.id.toLowerCase().includes(q),
  );
}

/** Map legacy Prisma Sport enum values to onboarding keys */
export const LEGACY_SPORT_ENUM_TO_KEY: Record<string, string> = {
  FOOTBALL: "football",
  TENNIS: "tennis",
  BASKETBALL: "basketball",
  GYM: "gym",
  RUNNING: "running",
  SWIMMING: "swimming",
  SQUASH: "squash",
  BADMINTON: "badminton",
  CRICKET: "cricket",
  CYCLING: "cycling",
};

export function normalizeSportKey(sport: string): string {
  return LEGACY_SPORT_ENUM_TO_KEY[sport] ?? sport.toLowerCase().replace(/_/g, "-");
}

export function getSportDisplay(sport: string): { name: string; emoji: string } {
  const key = normalizeSportKey(sport);
  const entry = getOnboardingSport(key);
  return {
    name: entry?.name ?? sport,
    emoji: entry?.emoji ?? "🏅",
  };
}
