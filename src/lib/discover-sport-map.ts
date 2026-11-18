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
  Padel: ["padel"],
  Pickleball: ["pickleball"],
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
  // Added so every sport people can pick has map tags (beta, Nov 2026).
  Snowboarding: ["skiing", "snowboard"],
  Athletics: ["athletics", "running"],
  "Long Jump": ["athletics"],
  "High Jump": ["athletics"],
  Javelin: ["athletics"],
  Discus: ["athletics"],
  "Shot Put": ["athletics"],
  "Field Hockey": ["field_hockey", "hockey"],
  Bobsled: ["bobsleigh"],
  Bowling: ["10pin", "9pin", "bowling"],
  Pool: ["billiards", "pool"],
  Paddleboarding: ["canoe", "sup", "paddleboarding"],
  Calisthenics: ["calisthenics", "fitness"],
  Powerlifting: ["powerlifting", "weightlifting", "fitness"],
  BJJ: ["bjj", "brazilian_jiu_jitsu", "jiu_jitsu", "martial_arts"],
  Kickboxing: ["kickboxing", "boxing", "martial_arts"],
  Capoeira: ["capoeira", "martial_arts"],
  Floorball: ["floorball"],
  "Gaelic Football": ["gaelic_games"],
  Hurling: ["hurling", "gaelic_games"],
  Shinty: ["shinty"],
};

/**
 * Venue types that host a sport even when OpenStreetMap doesn't tag it with
 * a sport= value (a gym is a fitness_centre, a bowling alley is a
 * bowling_alley). Keyed by OSM sport tag.
 */
const GENERIC_VENUES_BY_TAG: Record<string, string[]> = {
  fitness: ['["leisure"="fitness_centre"]', '["leisure"="fitness_station"]'],
  calisthenics: ['["leisure"="fitness_station"]'],
  crossfit: ['["leisure"="fitness_centre"]'],
  "10pin": ['["leisure"="bowling_alley"]'],
  skating: ['["leisure"="ice_rink"]'],
  ice_hockey: ['["leisure"="ice_rink"]'],
  swimming: ['["leisure"="swimming_pool"]["access"!="private"]', '["leisure"="water_park"]'],
  golf: ['["leisure"="golf_course"]'],
  climbing: ['["sport"="climbing"]'],
  dance: ['["leisure"="dance"]'],
};

/** Search out to 10 miles; the route prefers results within 5. */
export const DISCOVER_NEAR_MILES = 5;
export const DISCOVER_FAR_MILES = 10;
const DISCOVER_SEARCH_RADIUS_M = Math.round(DISCOVER_FAR_MILES * 1609.34);
const MAX_OVERPASS_ELEMENTS = 200;

/** Resolve sport query param (display name) to OSM tags, or null if unknown. */
/** "table-tennis", "Table Tennis", "table_tennis" -> "table tennis". */
function sportLookupKey(value: string): string {
  return value.trim().toLowerCase().replace(/[-_]+/g, " ").replace(/\s+/g, " ");
}

/**
 * Resolve a sport id ("table-tennis") or display name ("Table Tennis") to
 * OSM tags, or null if unknown.
 */
export function resolveOsmSportTags(sport: string): string[] | null {
  const trimmed = sport.trim();
  if (SPORT_MAP[trimmed]) return SPORT_MAP[trimmed];

  const wanted = sportLookupKey(trimmed);
  const matchKey = Object.keys(SPORT_MAP).find(
    (key) => sportLookupKey(key) === wanted,
  );
  if (matchKey) return SPORT_MAP[matchKey];

  return null;
}

export function matchesOsmSportTags(
  tags: Record<string, string>,
  osmSportTags: string[] | null,
): boolean {
  if (osmSportTags === null) return true;
  const values = (tags.sport ?? "")
    .toLowerCase()
    .split(";")
    .map((v) => v.trim())
    .filter(Boolean);
  if (values.some((v) => osmSportTags.includes(v))) return true;
  // Untagged gyms, bowling alleys, ice rinks... that host this sport.
  return genericVenueMatch(tags, osmSportTags);
}

function genericVenueMatch(
  tags: Record<string, string>,
  osmSportTags: string[],
): boolean {
  const leisure = tags.leisure?.toLowerCase();
  if (!leisure) return false;
  return osmSportTags.some((tag) =>
    (GENERIC_VENUES_BY_TAG[tag] ?? []).some((filter) =>
      filter.includes(`"leisure"="${leisure}"`),
    ),
  );
}

function aroundClause(lat: number, lng: number): string {
  return `(around:${DISCOVER_SEARCH_RADIUS_M},${lat},${lng})`;
}

/** Matches the tag alone or inside a multi-value tag: "padel;tennis". */
function sportRegexPattern(osmTags: string[]): string {
  const escaped = osmTags.map((t) =>
    t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
  );
  return `(^|;) *(${escaped.join("|")}) *(;|$)`;
}

function wrapQuery(lines: string[]): string {
  return `
[out:json][timeout:25];
(
${lines.join("\n")}
);
out center ${MAX_OVERPASS_ELEMENTS};
`.trim();
}

/**
 * Named places to play this sport: anything tagged with it (pitches,
 * courts, sports centres, halls), plus venue types that host it untagged.
 * Returns null for a sport we can't map, so callers skip OpenStreetMap.
 */
export function buildVenuesOverpassQuery(
  lat: number,
  lng: number,
  sport: string,
): string | null {
  const osmTags = resolveOsmSportTags(sport);
  if (!osmTags) return null;
  const around = aroundClause(lat, lng);
  const sportFilter = `["sport"~"${sportRegexPattern(osmTags)}",i]`;
  const lines = [
    `  nwr["leisure"]${sportFilter}["name"]${around};`,
    `  nwr["amenity"]${sportFilter}["name"]${around};`,
  ];
  const generic = new Set(osmTags.flatMap((t) => GENERIC_VENUES_BY_TAG[t] ?? []));
  for (const filter of generic) {
    lines.push(`  nwr${filter}["name"]${around};`);
  }
  return wrapQuery(lines);
}

/** Named sports clubs for this sport. Null for a sport we can't map. */
export function buildClubsOverpassQuery(
  lat: number,
  lng: number,
  sport: string,
): string | null {
  const osmTags = resolveOsmSportTags(sport);
  if (!osmTags) return null;
  const around = aroundClause(lat, lng);
  const sportFilter = `["sport"~"${sportRegexPattern(osmTags)}",i]`;
  return wrapQuery([
    `  nwr["club"="sport"]${sportFilter}["name"]${around};`,
    `  nwr["leisure"="club"]${sportFilter}["name"]${around};`,
    `  nwr["club"]${sportFilter}["name"]${around};`,
  ]);
}
