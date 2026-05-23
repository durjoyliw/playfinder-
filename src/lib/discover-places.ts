import { DISCOVER_VENUES } from "@/lib/venues";
import {
  matchesOsmSportTags as matchTags,
  resolveOsmSportTags,
} from "@/lib/discover-sport-map";

export { matchTags as matchesOsmSportTags, resolveOsmSportTags, SPORT_MAP } from "@/lib/discover-sport-map";

/** Glasgow city centre */
export const GLASGOW_CENTER = { lat: 55.8642, lng: -4.2518 };

const EARTH_RADIUS_MILES = 3958.8;

export type DiscoverTabType = "venues" | "clubs";

export type OpenStatus = "open" | "closed" | "closes_soon";

export interface DiscoverPlace {
  id: string;
  name: string;
  address: string | null;
  lat: number;
  lng: number;
  distanceMiles: number;
  openStatus: OpenStatus | string | null;
  bookable: boolean | null;
  website?: string | null;
  phone?: string | null;
  sports?: string[];
}

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

function isVenueBookable(url: string): boolean {
  const lower = url.toLowerCase();
  return (
    lower.includes("glasgowclub.org") ||
    lower.includes("powerleague") ||
    lower.includes("goals") ||
    lower.includes("oneren")
  );
}

function venueToDiscoverPlace(
  venue: (typeof DISCOVER_VENUES)[number],
  index: number,
): DiscoverPlace {
  const distanceMiles = haversineMiles(
    GLASGOW_CENTER.lat,
    GLASGOW_CENTER.lng,
    venue.lat,
    venue.lng,
  );

  return {
    id: index.toString(),
    name: venue.name,
    address: venue.address,
    lat: venue.lat,
    lng: venue.lng,
    website: venue.url,
    sports: venue.sports,
    distanceMiles: Math.round(distanceMiles * 10) / 10,
    openStatus: null,
    bookable: isVenueBookable(venue.url),
  };
}

export const MOCK_VENUES: DiscoverPlace[] = DISCOVER_VENUES.map(venueToDiscoverPlace);

export const MOCK_CLUBS: DiscoverPlace[] = [
  { id: "c1", name: "Kelvin FC", address: "Maryhill, Glasgow G20", lat: 55.882, lng: -4.298, distanceMiles: 1.8, openStatus: null, bookable: false, website: "https://glasgowkelvinfc.co.uk", sports: ["Football"] },
  { id: "c2", name: "Glasgow Green FC", address: "Glasgow Green 4G, Glasgow G40", lat: 55.850, lng: -4.231, distanceMiles: 2.0, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Football"] },
  { id: "c3", name: "Glasgow Eagles Youth FC", address: "Glasgow G32", lat: 55.848, lng: -4.198, distanceMiles: 2.6, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Football"] },
  { id: "c4", name: "West End Tennis Club", address: "Hyndland, Glasgow G12", lat: 55.873, lng: -4.305, distanceMiles: 2.3, openStatus: null, bookable: true, website: "https://westendtennisclub.co.uk", sports: ["Tennis"] },
  { id: "c5", name: "Hillhead Sports Club", address: "32 Hughenden Rd, Glasgow G12 9XP", lat: 55.876, lng: -4.302, distanceMiles: 2.1, openStatus: "Open now", bookable: true, website: "https://hillheadsportsclub.co.uk", sports: ["Tennis", "Cricket", "Rugby"] },
  { id: "c6", name: "Glasgow University Tennis Club", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: null, bookable: true, website: "https://www.gla.ac.uk/myglasgow/sport/", sports: ["Tennis", "Squash"] },
  { id: "c7", name: "Glasgow Tigers Basketball", address: "Tollcross, Glasgow G32", lat: 55.849, lng: -4.210, distanceMiles: 2.6, openStatus: null, bookable: false, website: "https://glasgowtigers.co.uk", sports: ["Basketball"] },
  { id: "c8", name: "Glasgow University Basketball Club", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Basketball"] },
  { id: "c9", name: "Rainbow Glasgaroos Basketball", address: "Glasgow West End", lat: 55.868, lng: -4.291, distanceMiles: 1.4, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Basketball"] },
  { id: "c10", name: "Glasgow Athletic Club", address: "West End, Glasgow", lat: 55.871, lng: -4.295, distanceMiles: 1.1, openStatus: null, bookable: false, website: "https://glasgowathleticclub.co.uk", sports: ["Running", "Athletics"] },
  { id: "c11", name: "Red Star Athletics Club", address: "Crownpoint Sports Complex, 183 Crownpoint Rd G40 2AL", lat: 55.852, lng: -4.223, distanceMiles: 1.9, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Running", "Athletics"] },
  { id: "c12", name: "Jiggly Joggers Running Club", address: "East End, Glasgow G32", lat: 55.849, lng: -4.203, distanceMiles: 2.7, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Running"] },
  { id: "c13", name: "Clyde Swimmers", address: "Tollcross International Pool, Glasgow G32", lat: 55.849, lng: -4.198, distanceMiles: 3.5, openStatus: null, bookable: false, website: "https://clydeswimmers.co.uk", sports: ["Swimming"] },
  { id: "c14", name: "Glasgow Western Masters Swimming", address: "North Woodside Leisure Centre, Glasgow G4", lat: 55.875, lng: -4.272, distanceMiles: 1.3, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Swimming"] },
  { id: "c15", name: "Shettleston Boxing Club", address: "Shettleston, Glasgow G32", lat: 55.847, lng: -4.196, distanceMiles: 3.1, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Boxing"] },
  { id: "c16", name: "Easterhouse Phoenix Boxing Club", address: "5 Shandwick St, Glasgow G34 9BN", lat: 55.866, lng: -4.116, distanceMiles: 5.2, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Boxing"] },
  { id: "c17", name: "Kynoch Boxing Gym", address: "Glasgow City Centre", lat: 55.862, lng: -4.245, distanceMiles: 0.9, openStatus: null, bookable: true, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Boxing"] },
  { id: "c18", name: "Steven McLaren Martial Arts", address: "Easterhouse Sports Centre, Auchinlea Rd G34 9HQ", lat: 55.866, lng: -4.116, distanceMiles: 5.2, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Martial Arts", "Taekwondo"] },
  { id: "c19", name: "Craigend Karate Club", address: "St Rose of Lima Primary, Glasgow G33 5QS", lat: 55.879, lng: -4.163, distanceMiles: 4.3, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Martial Arts", "Karate"] },
  { id: "c20", name: "Sunny Cycles Community Club", address: "Glasgow Southside", lat: 55.835, lng: -4.261, distanceMiles: 2.9, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Cycling"] },
  { id: "c21", name: "Glasgow University Cycling Club", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Cycling"] },
  { id: "c22", name: "Glasgow Warriors", address: "Scotstoun Stadium, Danes Dr G14 9HD", lat: 55.877, lng: -4.354, distanceMiles: 3.8, openStatus: null, bookable: false, website: "https://glasgowwarriors.org", sports: ["Rugby"] },
  { id: "c23", name: "Hillhead Rugby Club", address: "Hughenden Rd, Glasgow G12", lat: 55.876, lng: -4.302, distanceMiles: 2.1, openStatus: null, bookable: false, website: "https://hillheadsportsclub.co.uk", sports: ["Rugby"] },
  { id: "c24", name: "Glasgow University Hockey Club", address: "Garscube Sports Complex, Glasgow G61", lat: 55.912, lng: -4.323, distanceMiles: 4.1, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Hockey"] },
  { id: "c25", name: "The Climbing Academy", address: "Glasgow City Centre", lat: 55.861, lng: -4.252, distanceMiles: 1.1, openStatus: "Open now", bookable: true, website: "https://theclimbingacademy.com", sports: ["Climbing", "Bouldering"] },
  { id: "c26", name: "Glasgow Roller Derby", address: "ARC, Glasgow Caledonian University G4 0BA", lat: 55.866, lng: -4.251, distanceMiles: 0.8, openStatus: null, bookable: false, website: "https://glasgowrollerderby.co.uk", sports: ["Roller Derby"] },
  { id: "c27", name: "Pinkston Watersports", address: "Pinkston Rd, Glasgow G4 0HF", lat: 55.868, lng: -4.239, distanceMiles: 1.0, openStatus: "Open now", bookable: true, website: "https://pinkston.co.uk", sports: ["Kayaking", "Canoeing", "Rowing"] },
  { id: "c28", name: "Glasgow University Boat Club", address: "Garscube Sports Complex, Glasgow G61", lat: 55.912, lng: -4.323, distanceMiles: 4.1, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Rowing"] },
  { id: "c29", name: "Glasgow Golf Club", address: "Killermont, Bearsden G61 2TW", lat: 55.912, lng: -4.322, distanceMiles: 4.2, openStatus: null, bookable: true, website: "https://glasgowgolfclub.com", sports: ["Golf"] },
  { id: "c30", name: "Glasgow University Gymnastics Club", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Gymnastics", "Trampolining"] },
  { id: "c31", name: "The Vanguard Centre", address: "Railway Arch, Glasgow City Centre", lat: 55.859, lng: -4.248, distanceMiles: 1.3, openStatus: null, bookable: true, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Fencing"] },
  { id: "c32", name: "Easterhouse Table Tennis Club", address: "Easterhouse Phoenix Centre, 5 Shandwick St G34 9BN", lat: 55.866, lng: -4.116, distanceMiles: 5.2, openStatus: null, bookable: false, website: "https://glasgowlife.sportsuite.co.uk", sports: ["Table Tennis"] },
  { id: "c33", name: "Glasgow University Netball Club", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: null, bookable: false, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Netball"] },
  { id: "c34", name: "Glasgow University Sports Association", address: "Stevenson Building, Glasgow G12 8QQ", lat: 55.872, lng: -4.289, distanceMiles: 1.6, openStatus: "Open now", bookable: true, website: "https://www.glasgowunisrc.org/gusa/clubs/", sports: ["Football", "Tennis", "Basketball", "Swimming", "Squash", "Rowing", "Cycling", "Rugby", "Hockey", "Boxing", "Gymnastics", "Judo", "Karate", "Volleyball", "Badminton"] },
];

function placeMatchesSport(place: DiscoverPlace, sport: string): boolean {
  if (!place.sports?.length) return false;
  const needle = sport.trim().toLowerCase();
  return place.sports.some((s) => {
    const hay = s.toLowerCase();
    return hay === needle || hay.includes(needle) || needle.includes(hay);
  });
}

function filterPlacesBySport(
  places: DiscoverPlace[],
  sport?: string,
): DiscoverPlace[] {
  const sorted = [...places].sort(
    (a, b) => a.distanceMiles - b.distanceMiles,
  );

  if (!sport?.trim()) return sorted;

  const filtered = sorted.filter((place) => placeMatchesSport(place, sport));
  return filtered.length > 0 ? filtered : sorted;
}

export function getMockDiscoverPlaces(
  type: DiscoverTabType,
  sport?: string,
): DiscoverPlace[] {
  const source = type === "clubs" ? MOCK_CLUBS : MOCK_VENUES;
  return filterPlacesBySport(source, sport);
}

export function sportKeyFromDisplayName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, "-");
}

export function matchesOsmSport(
  tags: Record<string, string>,
  sportDisplayName: string,
): boolean {
  return matchTags(tags, resolveOsmSportTags(sportDisplayName));
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
