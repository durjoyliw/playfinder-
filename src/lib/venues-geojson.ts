import type { MapMarker } from "@/components/discover/map-overlay-layout";
import type { Venue } from "@/lib/venues";

export function markersToVenuesGeoJSON(
  markers: MapMarker[],
): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: markers.map((marker) => ({
      type: "Feature",
      id: marker.id,
      geometry: {
        type: "Point",
        coordinates: [marker.lng, marker.lat],
      },
      properties: {
        id: marker.id,
        name: marker.title,
        address: marker.address ?? marker.location,
        sports: JSON.stringify(marker.sports ?? [marker.sport]),
        url: marker.url ?? "",
      },
    })),
  };
}

export function venuesToGeoJSON(venues: Venue[]): GeoJSON.FeatureCollection {
  return {
    type: "FeatureCollection",
    features: venues.map((venue, index) => ({
      type: "Feature",
      id: `${venue.name}-${index}`,
      geometry: {
        type: "Point",
        coordinates: [venue.lng, venue.lat],
      },
      properties: {
        id: `${venue.name}-${index}`,
        name: venue.name,
        address: venue.address,
        sports: JSON.stringify(venue.sports),
        url: venue.url,
      },
    })),
  };
}

export function geoJsonPropertiesToMarker(
  properties: GeoJSON.GeoJsonProperties,
  markers: MapMarker[],
): MapMarker | null {
  const id = properties?.id as string | undefined;
  if (!id) return null;
  return markers.find((m) => m.id === id) ?? null;
}
