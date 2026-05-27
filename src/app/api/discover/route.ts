import { validateRequest } from "@/auth";
import {
  buildAddress,
  getMockDiscoverPlaces,
  GLASGOW_CENTER,
  haversineMiles,
  isBookable,
  parseOpenStatus,
  type DiscoverPlace,
  type DiscoverTabType,
} from "@/lib/discover-places";
import {
  buildClubsOverpassQuery,
  buildVenuesOverpassQuery,
  matchesOsmSportTags,
  resolveOsmSportTags,
} from "@/lib/discover-sport-map";

const OVERPASS_PRIMARY =
  "https://overpass.kumi.systems/api/interpreter";
const OVERPASS_FALLBACK =
  "https://overpass.private.coffee/api/interpreter";
const OVERPASS_TIMEOUT_MS = 8000;
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

async function fetchOverpassFromEndpoint(
  endpoint: string,
  query: string,
): Promise<OverpassElement[]> {
  const body = `data=${encodeURIComponent(query)}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body,
      signal: controller.signal,
      cache: "no-store",
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Overpass API error: ${response.status}${errorText ? ` — ${errorText.slice(0, 200)}` : ""}`,
      );
    }

    const data = (await response.json()) as { elements?: OverpassElement[] };
    return data.elements ?? [];
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Overpass request timed out after ${OVERPASS_TIMEOUT_MS}ms`,
      );
    }
    throw error;
  }
}

async function fetchOverpass(query: string): Promise<OverpassElement[]> {
  try {
    return await fetchOverpassFromEndpoint(OVERPASS_PRIMARY, query);
  } catch (primaryError) {
    console.warn("Overpass primary mirror failed, trying fallback:", primaryError);
    return fetchOverpassFromEndpoint(OVERPASS_FALLBACK, query);
  }
}

function elementsToPlaces(
  elements: OverpassElement[],
  centerLat: number,
  centerLng: number,
  osmSportTags: string[] | null,
): DiscoverPlace[] {
  const seen = new Set<string>();
  const places: DiscoverPlace[] = [];

  for (const el of elements) {
    const tags = el.tags ?? {};
    const name = tags.name?.trim();
    if (!name) continue;

    if (!matchesOsmSportTags(tags, osmSportTags)) continue;

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
    const type = (searchParams.get("type") ?? "venues") as DiscoverTabType;
    const sport =
      searchParams.get("sport") ?? searchParams.get("sportKey") ?? "running";
    const lat = parseFloat(
      searchParams.get("lat") ?? String(GLASGOW_CENTER.lat),
    );
    const lng = parseFloat(
      searchParams.get("lng") ?? String(GLASGOW_CENTER.lng),
    );

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return Response.json({ error: "Invalid coordinates" }, { status: 400 });
    }

    const staticPlaces = getMockDiscoverPlaces(type, sport);
    if (staticPlaces.length === 0) {
      return Response.json([]);
    }

    const osmSportTags = resolveOsmSportTags(sport);
    const query =
      type === "clubs"
        ? buildClubsOverpassQuery(lat, lng, sport)
        : buildVenuesOverpassQuery(lat, lng, sport);

    try {
      const elements = await fetchOverpass(query);
      const overpassPlaces = elementsToPlaces(
        elements,
        lat,
        lng,
        osmSportTags,
      );
      if (overpassPlaces.length > 0) {
        return Response.json(overpassPlaces);
      }
    } catch (overpassError) {
      console.warn("Overpass unavailable, using static venues:", overpassError);
    }

    return Response.json(staticPlaces);
  } catch (error) {
    console.error("GET /api/discover failed:", error);
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") ?? "venues") as DiscoverTabType;
    const sport =
      searchParams.get("sport") ?? searchParams.get("sportKey") ?? "running";
    return Response.json(getMockDiscoverPlaces(type, sport));
  }
}
