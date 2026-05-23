/** Glasgow city centre */
export const GLASGOW_CENTER = { lat: 55.8642, lng: -4.2518 };

export type DiscoverTabType = "venues" | "clubs";

export type OpenStatus = "open" | "closed" | "closes_soon";

export interface DiscoverPlace {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  distanceMiles: number;
  openStatus: OpenStatus | null;
  bookable: boolean | null;
}

const EARTH_RADIUS_MILES = 3958.8;

export function haversineMiles(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_MILES * c;
}

export function formatDistanceMiles(miles: number): string {
  if (miles < 0.1) return "< 0.1 mi";
  return `${miles.toFixed(1)} mi`;
}

/** Map onboarding sport keys to OSM sport tag values */
export const SPORT_KEY_TO_OSM: Record<string, string[]> = {
  football: ["football", "soccer"],
  tennis: ["tennis"],
  basketball: ["basketball"],
  gym: ["fitness", "gymnastics"],
  running: ["running", "athletics"],
  swimming: ["swimming"],
  rugby: ["rugby"],
  cricket: ["cricket"],
  cycling: ["cycling"],
  badminton: ["badminton"],
  squash: ["squash"],
  golf: ["golf"],
  boxing: ["boxing"],
  volleyball: ["volleyball"],
  hockey: ["hockey", "field_hockey"],
  "table-tennis": ["table_tennis"],
  rowing: ["rowing"],
  climbing: ["climbing"],
  yoga: ["yoga"],
  crossfit: ["fitness"],
  padel: ["padel"],
  pickleball: ["pickleball"],
};

export function sportKeyFromDisplayName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function osmSportValuesForKey(sportKey: string): string[] {
  const key = sportKey.toLowerCase();
  return SPORT_KEY_TO_OSM[key] ?? [key.replace(/-/g, "_")];
}

export function matchesOsmSport(
  tags: Record<string, string>,
  sportKey: string,
): boolean {
  const osmSport = tags.sport?.toLowerCase();
  if (!osmSport) return true;
  const allowed = osmSportValuesForKey(sportKey);
  return allowed.some(
    (v) => osmSport === v || osmSport.includes(v) || v.includes(osmSport),
  );
}

export function parseOpenStatus(
  openingHours: string | undefined,
): OpenStatus | null {
  if (!openingHours) return null;
  const normalized = openingHours.trim().toLowerCase();
  if (normalized === "24/7" || normalized === "24/7 open") return "open";

  const now = new Date();
  const dayIndex = (now.getDay() + 6) % 7;
  const dayCodes = ["mo", "tu", "we", "th", "fr", "sa", "su"];
  const todayCode = dayCodes[dayIndex];
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const segments = openingHours.split(";").map((s) => s.trim());
  for (const segment of segments) {
    const lower = segment.toLowerCase();
    if (!lower.includes(todayCode) && !lower.includes("mo-su")) continue;

    const timeMatch = segment.match(
      /(\d{1,2}):(\d{2})\s*[-–]\s*(\d{1,2}):(\d{2})/,
    );
    if (!timeMatch) continue;

    const openMin =
      parseInt(timeMatch[1], 10) * 60 + parseInt(timeMatch[2], 10);
    const closeMin =
      parseInt(timeMatch[3], 10) * 60 + parseInt(timeMatch[4], 10);

    if (currentMinutes >= openMin && currentMinutes < closeMin) {
      if (closeMin - currentMinutes <= 60) return "closes_soon";
      return "open";
    }
    if (currentMinutes < openMin || currentMinutes >= closeMin) {
      return "closed";
    }
  }

  return null;
}

export function isBookable(tags: Record<string, string>): boolean | null {
  if (tags.booking === "yes" || tags.reservation === "yes") return true;
  if (tags.booking === "no" || tags.reservation === "no") return false;
  if (tags.website || tags["contact:website"]) return true;
  return null;
}

export function buildAddress(tags: Record<string, string>): string | null {
  if (tags["addr:full"]) return tags["addr:full"];
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] ?? tags["addr:place"],
    tags["addr:postcode"],
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  return tags.address ?? null;
}
