"use client";

import { GLASGOW_CENTER } from "@/lib/discover-places";
import {
  circlePolygon,
  type GeocodedPlace,
} from "@/lib/mapbox-geocode";
import { getMapboxToken, hasMapboxToken } from "@/lib/mapbox-token";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, type MutableRefObject } from "react";

const DEFAULT_CENTER: [number, number] = [
  GLASGOW_CENTER.lng,
  GLASGOW_CENTER.lat,
];
const DEFAULT_ZOOM = 11;

const RADIUS_SOURCE = "page-location-radius";
const RADIUS_FILL = "page-location-radius-fill";
const RADIUS_LINE = "page-location-radius-line";

/** Same Discover pin colour used for clubs / location accents. */
const PIN_COLOUR = "#56ccf2";

interface PageLocationMapProps {
  /**
   * Place chosen from the Settings Location autocomplete
   * (`MapboxLocationAutocomplete` + onFeatureSelect).
   * City/area → radius circle; postcode/address → Discover pin.
   */
  place: GeocodedPlace | null;
  className?: string;
}

/**
 * Compact Mapbox preview for Create-a-Page step 3.
 * Reuses Discover's token, dark-v11 style, and `.pf-map-marker` pin markup.
 */
export function PageLocationMap({ place, className }: PageLocationMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const lastValidRef = useRef<GeocodedPlace | null>(null);
  const tokenPresent = hasMapboxToken();

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      "[PageLocationMap] NEXT_PUBLIC_MAPBOX_TOKEN defined:",
      !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      "hasMapboxToken():",
      hasMapboxToken(),
    );
  }, []);

  useEffect(() => {
    const token = getMapboxToken();
    if (!token || !containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      attributionControl: false,
      interactive: false,
    });

    map.on("load", () => {
      map.resize();
      if (!map.getSource(RADIUS_SOURCE)) {
        map.addSource(RADIUS_SOURCE, {
          type: "geojson",
          data: { type: "FeatureCollection", features: [] },
        });
        map.addLayer({
          id: RADIUS_FILL,
          type: "fill",
          source: RADIUS_SOURCE,
          paint: {
            "fill-color": PIN_COLOUR,
            "fill-opacity": 0.16,
          },
        });
        map.addLayer({
          id: RADIUS_LINE,
          type: "line",
          source: RADIUS_SOURCE,
          paint: {
            "line-color": PIN_COLOUR,
            "line-width": 1.5,
            "line-opacity": 0.45,
          },
        });
      }
      if (lastValidRef.current) {
        applyPlace(map, lastValidRef.current, markerRef);
      }
    });

    map.on("error", (e) => {
      // eslint-disable-next-line no-console
      console.warn("[PageLocationMap] mapbox error", e.error?.message ?? e);
    });

    mapRef.current = map;

    return () => {
      markerRef.current?.remove();
      markerRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !place) return;
    lastValidRef.current = place;
    applyPlace(map, place, markerRef);
  }, [place]);

  return (
    <div
      className={
        className ??
        "relative mb-8 h-[168px] overflow-hidden rounded-[1rem] border border-[#2a2f2a] bg-[#0c0e0c]"
      }
    >
      {tokenPresent ? (
        <div ref={containerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center px-4 text-center font-dm-mono text-[10px] uppercase tracking-[0.1em] text-[#7e8a7e]">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
        </div>
      )}
      <span className="pointer-events-none absolute bottom-3 left-3 rounded-full border border-[#2a2f2a] bg-[rgba(8,9,10,0.72)] px-2.5 py-1 font-dm-mono text-[10px] uppercase tracking-[0.1em] text-[#7e8a7e]">
        Map preview
      </span>
    </div>
  );
}

function clearRadius(map: mapboxgl.Map) {
  const source = map.getSource(RADIUS_SOURCE) as
    | mapboxgl.GeoJSONSource
    | undefined;
  source?.setData({ type: "FeatureCollection", features: [] });
}

function setRadius(map: mapboxgl.Map, place: GeocodedPlace) {
  const source = map.getSource(RADIUS_SOURCE) as
    | mapboxgl.GeoJSONSource
    | undefined;
  if (!source) return;
  source.setData({
    type: "FeatureCollection",
    features: [circlePolygon(place.lng, place.lat, place.radiusMeters)],
  });
}

function clearMarker(markerRef: MutableRefObject<mapboxgl.Marker | null>) {
  markerRef.current?.remove();
  markerRef.current = null;
}

/** Same DOM pin Discover uses (`pf-map-marker` / `pf-map-pin` in globals.css). */
function createDiscoverPinElement(): HTMLButtonElement {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "pf-map-marker";
  el.setAttribute("aria-label", "Location");
  el.style.pointerEvents = "none";
  el.innerHTML = `<div class="pf-map-pin" style="background:${PIN_COLOUR}"><span class="pf-map-pin-emoji">📍</span></div><div class="pf-map-pulse" style="border-color:${PIN_COLOUR}"></div>`;
  return el;
}

function applyPlace(
  map: mapboxgl.Map,
  place: GeocodedPlace,
  markerRef: MutableRefObject<mapboxgl.Marker | null>,
) {
  const run = () => {
    if (place.kind === "area") {
      clearMarker(markerRef);
      setRadius(map, place);
      const zoom =
        place.radiusMeters >= 8000 ? 10 : place.radiusMeters >= 4000 ? 11 : 12;
      map.easeTo({
        center: [place.lng, place.lat],
        zoom,
        duration: 500,
      });
      return;
    }

    clearRadius(map);
    clearMarker(markerRef);
    markerRef.current = new mapboxgl.Marker({
      element: createDiscoverPinElement(),
      anchor: "bottom",
    })
      .setLngLat([place.lng, place.lat])
      .addTo(map);

    map.easeTo({
      center: [place.lng, place.lat],
      zoom: 14,
      duration: 500,
    });
  };

  if (map.isStyleLoaded() && map.getSource(RADIUS_SOURCE)) {
    run();
  } else {
    map.once("idle", run);
  }
}
