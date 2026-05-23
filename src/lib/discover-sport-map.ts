/** App display names → OpenStreetMap sport tag values for Overpass queries */

export const SPORT_MAP: Record<string, string[]> = {
  Football: ["football", "soccer"],
  Tennis: ["tennis"],
  Basketball: ["basketball"],
  Running: ["running", "athletics"],
  Gym: ["fitness", "gymnastics"],
  Swimming: ["swimming"],
  Squash: ["squash"],
  Badminton: ["badminton"],
  Cricket: ["cricket"],
  Cycling: ["cycling"],
  Rugby: ["rugby_union", "rugby_league", "rugby"],
  Golf: ["golf"],
  Boxing: ["boxing"],
  "Martial Arts": ["martial_arts", "judo", "karate", "taekwondo"],
  Volleyball: ["volleyball"],
  Hockey: ["field_hockey", "hockey"],
  "Table Tennis": ["table_tennis"],
  Climbing: ["climbing"],
  Yoga: ["yoga", "fitness"],
  Pilates: ["pilates", "fitness"],
  Rowing: ["rowing", "canoe"],
  Skiing: ["skiing"],
  Surfing: ["surfing"],
  Archery: ["archery"],
  Gymnastics: ["gymnastics"],
  Netball: ["netball"],
  "Water Polo": ["water_polo"],
  Fencing: ["fencing"],
  Weightlifting: ["weightlifting", "fitness"],
  "American Football": ["american_football"],
  Baseball: ["baseball"],
  Softball: ["softball"],
  Lacrosse: ["lacrosse"],
  Handball: ["handball"],
  Futsal: ["futsal", "football"],
  Padel: ["padel", "tennis"],
  Pickleball: ["pickleball", "tennis"],
  Snooker: ["billiards", "snooker"],
  Darts: ["darts"],
  "Ice Hockey": ["ice_hockey"],
  "Ice Skating": ["skating", "ice_rink"],
  "Roller Skating": ["skating"],
  Skateboarding: ["skateboard"],
  BMX: ["bmx", "cycling"],
  "Horse Riding": ["equestrian", "horse_racing"],
  Triathlon: ["triathlon", "swimming", "cycling", "running"],
  Duathlon: ["running", "cycling"],
  Pentathlon: ["athletics"],
  Decathlon: ["athletics"],
  "Track and Field": ["athletics", "running"],
  "Cross Country": ["running", "athletics"],
  Orienteering: ["orienteering"],
  Hiking: ["hiking"],
  Mountaineering: ["climbing"],
  Bouldering: ["climbing"],
  Parkour: ["free_running"],
  Dance: ["dance"],
  Cheerleading: ["gymnastics"],
  Trampolining: ["gymnastics", "trampoline"],
  Diving: ["diving", "swimming"],
  Sailing: ["sailing"],
  Kayaking: ["canoe", "kayak"],
  Canoeing: ["canoe"],
  Windsurfing: ["windsurfing", "surfing"],
  "Kite Surfing": ["kitesurfing"],
  "Stand Up Paddling": ["paddle_tennis", "canoe"],
  "Open Water Swimming": ["swimming"],
  Polo: ["polo"],
  Croquet: ["croquet"],
  Bowls: ["bowls"],
  Petanque: ["boules"],
  Curling: ["curling"],
  Shooting: ["shooting"],
  Equestrian: ["equestrian"],
  Taekwondo: ["taekwondo", "martial_arts"],
  Judo: ["judo", "martial_arts"],
  Karate: ["karate", "martial_arts"],
  Wrestling: ["wrestling", "martial_arts"],
  MMA: ["martial_arts"],
  "Muay Thai": ["martial_arts"],
  "Brazilian Jiu Jitsu": ["martial_arts"],
  CrossFit: ["fitness", "crossfit"],
};

const FITNESS_CENTRE_HINTS = new Set([
  "fitness",
  "gymnastics",
  "crossfit",
  "pilates",
  "yoga",
  "weightlifting",
]);

const ELEMENT_TYPES = ["node", "way", "relation"] as const;
export const DISCOVER_SEARCH_RADIUS_M = 5000;
const MAX_OVERPASS_ELEMENTS = 30;

/** Resolve sport query param (display name) to OSM tags, or null if unknown. */
export function resolveOsmSportTags(sportDisplayName: string): string[] | null {
  const trimmed = sportDisplayName.trim();
  if (SPORT_MAP[trimmed]) return SPORT_MAP[trimmed];

  const matchKey = Object.keys(SPORT_MAP).find(
    (key) => key.toLowerCase() === trimmed.toLowerCase(),
  );
  if (matchKey) return SPORT_MAP[matchKey];

  return null;
}

export function matchesOsmSportTags(
  tags: Record<string, string>,
  osmSportTags: string[] | null,
): boolean {
  if (osmSportTags === null) return true;
  const osmSport = tags.sport?.toLowerCase();
  if (!osmSport) return true;
  return osmSportTags.some(
    (v) =>
      osmSport === v ||
      osmSport.includes(v) ||
      v.includes(osmSport),
  );
}

function includesFitnessCentre(osmTags: string[]): boolean {
  return osmTags.some((t) => FITNESS_CENTRE_HINTS.has(t));
}

function aroundClause(lat: number, lng: number): string {
  return `(around:${DISCOVER_SEARCH_RADIUS_M},${lat},${lng})`;
}

function sportRegexPattern(osmTags: string[]): string {
  const escaped = osmTags.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return `^(${escaped.join("|")})$`;
}

function appendElementLines(
  lines: string[],
  filter: string,
  around: string,
): void {
  for (const el of ELEMENT_TYPES) {
    lines.push(`  ${el}${filter}${around};`);
  }
}

export function buildVenuesOverpassQuery(
  lat: number,
  lng: number,
  sportDisplayName: string,
): string {
  const around = aroundClause(lat, lng);
  const osmTags = resolveOsmSportTags(sportDisplayName);
  const lines: string[] = [];

  if (osmTags) {
    const sportFilter = `["sport"~"${sportRegexPattern(osmTags)}",i]`;
    appendElementLines(lines, `["leisure"="pitch"]${sportFilter}`, around);
    appendElementLines(lines, `["leisure"="sports_centre"]`, around);
    appendElementLines(lines, `["amenity"="sports_centre"]`, around);
    if (includesFitnessCentre(osmTags)) {
      appendElementLines(lines, `["leisure"="fitness_centre"]`, around);
    }
  } else {
    appendElementLines(lines, `["leisure"="pitch"]`, around);
    appendElementLines(lines, `["leisure"="sports_centre"]`, around);
    appendElementLines(lines, `["amenity"="sports_centre"]`, around);
  }

  return `
[out:json][timeout:25];
(
${lines.join("\n")}
);
out center ${MAX_OVERPASS_ELEMENTS};
`.trim();
}

export function buildClubsOverpassQuery(
  lat: number,
  lng: number,
  sportDisplayName: string,
): string {
  const around = aroundClause(lat, lng);
  const osmTags = resolveOsmSportTags(sportDisplayName);
  const lines: string[] = [];

  if (osmTags) {
    const sportFilter = `["sport"~"${sportRegexPattern(osmTags)}",i]`;
    appendElementLines(lines, `["leisure"="club"]${sportFilter}`, around);
    appendElementLines(
      lines,
      `["sport"~"${sportRegexPattern(osmTags)}",i]["name"]`,
      around,
    );
    appendElementLines(lines, `["club"="sport"]`, around);
  } else {
    appendElementLines(lines, `["leisure"="club"]`, around);
    appendElementLines(lines, `["sport"]["name"]`, around);
    appendElementLines(lines, `["club"="sport"]`, around);
  }

  return `
[out:json][timeout:25];
(
${lines.join("\n")}
);
out center ${MAX_OVERPASS_ELEMENTS};
`.trim();
}
