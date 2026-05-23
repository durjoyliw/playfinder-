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

/** Minimal bbox query to verify POST fetch works from Next.js */
const OVERPASS_SIMPLE_TEST_QUERY = `[out:json][timeout:25];node["leisure"="sports_centre"](55.82,-4.35,55.92,-4.15);out 5;`;

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
  logLabel = "overpass",
): Promise<OverpassElement[]> {
  const body = `data=${encodeURIComponent(query)}`;

  console.log(`[Overpass:${logLabel}] POST url:`, endpoint);
  console.log(`[Overpass:${logLabel}] query string:`, query);
  console.log(`[Overpass:${logLabel}] POST body:`, body);

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

    console.log(
      `[Overpass:${logLabel}] response status:`,
      response.status,
      response.statusText,
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(
        `Overpass API error: ${response.status}${errorText ? ` — ${errorText.slice(0, 200)}` : ""}`,
      );
    }

    const data = (await response.json()) as { elements?: OverpassElement[] };
    const elements = data.elements ?? [];
    console.log(`[Overpass:${logLabel}] elements returned:`, elements.length);
    return elements;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(
        `Overpass request timed out after ${OVERPASS_TIMEOUT_MS}ms (${logLabel})`,
      );
    }
    throw error;
  }
}

let hasRunOverpassConnectivityTest = false;

async function runOverpassConnectivityTestOnce(): Promise<void> {
  if (hasRunOverpassConnectivityTest) return;
  hasRunOverpassConnectivityTest = true;

  try {
    const testElements = await fetchOverpassFromEndpoint(
      OVERPASS_PRIMARY,
      OVERPASS_SIMPLE_TEST_QUERY,
      "simple-test",
    );
    console.log(
      "[Overpass] simple test OK — fetch works from Next.js, sample count:",
      testElements.length,
    );
  } catch (testError) {
    console.error("[Overpass] simple test FAILED:", testError);
  }
}

async function fetchOverpass(query: string): Promise<OverpassElement[]> {
  await runOverpassConnectivityTestOnce();

  try {
    return await fetchOverpassFromEndpoint(
      OVERPASS_PRIMARY,
      query,
      "primary",
    );
  } catch (primaryError) {
    console.warn("Overpass primary mirror failed, trying fallback:", primaryError);
    return fetchOverpassFromEndpoint(OVERPASS_FALLBACK, query, "fallback");
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

    const osmSportTags = resolveOsmSportTags(sport);
    const query =
      type === "clubs"
        ? buildClubsOverpassQuery(lat, lng, sport)
        : buildVenuesOverpassQuery(lat, lng, sport);

    console.log("[GET /api/discover] params:", { type, sport, lat, lng });
    console.log("[GET /api/discover] built Overpass query:", query);

    try {
      const elements = await fetchOverpass(query);
      const places = elementsToPlaces(elements, lat, lng, osmSportTags);
      console.log(
        "[GET /api/discover] Overpass success, places after filter:",
        places.length,
      );
      return Response.json(places);
    } catch (overpassError) {
      console.error("Overpass mirrors unavailable, using mock data:", overpassError);
      return Response.json(getMockDiscoverPlaces(type, sport));
    }
  } catch (error) {
    console.error("GET /api/discover failed:", error);
    const { searchParams } = new URL(req.url);
    const type = (searchParams.get("type") ?? "venues") as DiscoverTabType;
    const sport = searchParams.get("sport") ?? "Running";
    return Response.json(getMockDiscoverPlaces(type, sport));
  }
}
