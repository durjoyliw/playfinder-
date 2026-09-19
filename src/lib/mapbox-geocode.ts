/**
 * Shared Mapbox Geocoding helpers.
 * Same token (`NEXT_PUBLIC_MAPBOX_TOKEN`) and GB types as
 * `MapboxLocationAutocomplete` / Discover.
 */

import type { MapboxGeocodeFeature } from "@/components/mapbox-location-autocomplete";
import { getMapboxToken } from "@/lib/mapbox-token";

export type MapboxPlaceKind = "area" | "precise";

export interface GeocodedPlace {
  lng: number;
  lat: number;
  placeName: string;
  /** City/neighbourhood → area (radius). Postcode/address → precise (pin). */
  kind: MapboxPlaceKind;
  placeTypes: string[];
  /** Approximate radius in metres for area overlays */
  radiusMeters: number;
}

const AREA_TYPES = new Set([
  "place",
  "locality",
  "neighborhood",
  "district",
  "region",
]);

const PRECISE_TYPES = new Set(["postcode", "address", "poi"]);

function kindFromPlaceTypes(types: string[]): MapboxPlaceKind {
  if (types.some((t) => PRECISE_TYPES.has(t))) return "precise";
  if (types.some((t) => AREA_TYPES.has(t))) return "area";
  return "area";
}

function radiusForTypes(types: string[]): number {
  if (types.includes("neighborhood")) return 1800;
  if (types.includes("locality")) return 3500;
  if (types.includes("place")) return 6000;
  if (types.includes("district") || types.includes("region")) return 10000;
  return 5000;
}

/** Convert a Mapbox autocomplete feature into map overlay state. */
export function geocodedPlaceFromFeature(
  feature: MapboxGeocodeFeature,
): GeocodedPlace | null {
  if (!feature.center || feature.center.length < 2) return null;
  const placeTypes = feature.place_type ?? [];
  return {
    lng: feature.center[0],
    lat: feature.center[1],
    placeName: feature.place_name,
    kind: kindFromPlaceTypes(placeTypes),
    placeTypes,
    radiusMeters: radiusForTypes(placeTypes),
  };
}

/** Build a GeoJSON Polygon approximating a circle (no turf dependency). */
export function circlePolygon(
  lng: number,
  lat: number,
  radiusMeters: number,
  steps = 64,
): GeoJSON.Feature<GeoJSON.Polygon> {
  const coords: [number, number][] = [];
  const earth = 6371000;
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const d = radiusMeters / earth;

  for (let i = 0; i <= steps; i++) {
    const bearing = (i / steps) * 2 * Math.PI;
    const lat2 = Math.asin(
      Math.sin(latRad) * Math.cos(d) +
        Math.cos(latRad) * Math.sin(d) * Math.cos(bearing),
    );
    const lng2 =
      lngRad +
      Math.atan2(
        Math.sin(bearing) * Math.sin(d) * Math.cos(latRad),
        Math.cos(d) - Math.sin(latRad) * Math.sin(lat2),
      );
    coords.push([(lng2 * 180) / Math.PI, (lat2 * 180) / Math.PI]);
  }

  return {
    type: "Feature",
    properties: {},
    geometry: { type: "Polygon", coordinates: [coords] },
  };
}

/**
 * Geocode a free-text query with the same Mapbox endpoint Location settings uses.
 */
export async function geocodePlaceQuery(
  query: string,
): Promise<GeocodedPlace | null> {
  const token = getMapboxToken();
  const text = query.trim();
  if (!token || text.length < 2) return null;

  try {
    const encoded = encodeURIComponent(text);
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=gb&types=postcode,place,neighborhood,locality,address&limit=1`;
    const res = await fetch(url);
    if (!res.ok) return null;

    const data = (await res.json()) as { features?: MapboxGeocodeFeature[] };
    const feature = data.features?.[0];
    if (!feature) return null;
    return geocodedPlaceFromFeature(feature);
  } catch {
    return null;
  }
}
