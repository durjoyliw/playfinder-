import { validateRequest } from "@/auth";
import {
  buildAddress,
  GLASGOW_CENTER,
  haversineMiles,
  isBookable,
  matchesOsmSport,
  parseOpenStatus,
  sportKeyFromDisplayName,
  type DiscoverPlace,
} from "@/lib/discover-places";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const SEARCH_RADIUS_M = 8000;
const MAX_RESULTS = 15;

interface OverpassElement {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
}

function elementCoords(el: OverpassElement): { lat: number; lng: number } | null {
  if (el.lat != null && el.lon != null) return { lat: el.lat, lng: el.lon };
  if (el.center) return { lat: el.center.lat, lng: el.center.lon };
  return null;
}

function buildVenuesQuery(lat: number, lng: number): string {
  const around = `(around:${SEARCH_RADIUS_M},${lat},${lng})`;
  return `
[out:json][timeout:25];
(
  node["leisure"="pitch"]${around};
  way["leisure"="pitch"]${around};
  node["leisure"="sports_centre"]${around};
  way["leisure"="sports_centre"]${around};
  node["leisure"="track"]${around};
  way["leisure"="track"]${around};
  node["amenity"="sports_centre"]${around};
  way["amenity"="sports_centre"]${around};
);
out center ${MAX_RESULTS * 2};
`.trim();
}

function buildClubsQuery(lat: number, lng: number): string {
  const around = `(around:${SEARCH_RADIUS_M},${lat},${lng})`;
  return `
[out:json][timeout:25];
(
  node["leisure"="club"]${around};
  way["leisure"="club"]${around};
  node["sport"]["name"]${around};
  way["sport"]["name"]${around};
  node["club"="sport"]${around};
  way["club"="sport"]${around};
);
out center ${MAX_RESULTS * 2};
`.trim();
}

async function fetchOverpass(query: string): Promise<OverpassElement[]> {
  const res = await fetch(OVERPASS_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
    next: { revalidate: 3600 },
  });

  if (!res.ok) {
    throw new Error(`Overpass API error: ${res.status}`);
  }

  const data = (await res.json()) as { elements?: OverpassElement[] };
  return data.elements ?? [];
}

function elementsToPlaces(
  elements: OverpassElement[],
  centerLat: number,
  centerLng: number,
  sportKey: string,
): DiscoverPlace[] {
  const seen = new Set<string>();
  const places: DiscoverPlace[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    if (!matchesOsmSport(tags, sportKey)) continue;

    const coords = elementCoords(el);
    if (!coords) continue;

    const id = `${el.type}/${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);

    const distanceMiles = haversineMiles(
      centerLat,
      centerLng,
      coords.lat,
      coords.lng,
    );

    places.push({
      id,
      name,
      address: buildAddress(tags),
      lat: coords.lat,
      lng: coords.lng,
      distanceMiles,
      openStatus: parseOpenStatus(tags.opening_hours),
      bookable: isBookable(tags),
    });
  }

  return places
    .sort((a, b) => a.distanceMiles - b.distanceMiles)
    .slice(0, MAX_RESULTS);
}

export async function GET(req: Request) {
  try {
    const { user } = await validateRequest();
    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") ?? "venues";
    const sport = searchParams.get("sport") ?? "Running";
    const lat = parseFloat(
      searchParams.get("lat") ?? String(GLASGOW_CENTER.lat),
    );
    const lng = parseFloat(
      searchParams.get("lng") ?? String(GLASGOW_CENTER.lng),
    );

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const sportKey = sportKeyFromDisplayName(sport);
    const query =
      type === "clubs" ? buildClubsQuery(lat, lng) : buildVenuesQuery(lat, lng);

    const elements = await fetchOverpass(query);
    const places = elementsToPlaces(elements, lat, lng, sportKey);

    return Response.json(places);
  } catch (error) {
    console.error("GET /api/discover failed:", error);
    return Response.json({ error: "Failed to fetch places" }, { status: 500 });
  }
}
