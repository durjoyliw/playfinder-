"use client";

import "mapbox-gl/dist/mapbox-gl.css";

import {
  geoJsonPropertiesToMarker,
  markersToVenuesGeoJSON,
} from "@/lib/venues-geojson";
import mapboxgl from "mapbox-gl";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";

/** Glasgow city centre — [lng, lat] */
const GLASGOW_CENTER: [number, number] = [-4.2518, 55.8642];
const GLASGOW_ZOOM = 11;

const VENUES_SOURCE_ID = "venues";
const VENUE_PINS_LAYER_ID = "venue-pins";
const VENUE_PINS_SELECTED_LAYER_ID = "venue-pins-selected";

export interface MapMarker {
  id: string;
  lng: number;
  lat: number;
  title: string;
  sport: string;
  venue: string;
  skillLevel: string;
  organizer: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  location: string;
  playersConfirmed: number;
  playersNeeded: number;
  image: string;
  price?: string;
  url?: string;
  sports?: string[];
  address?: string;
}

interface MapOverlayLayoutProps {
  markers: MapMarker[];
  onMarkerClick: (marker: MapMarker | null) => void;
  selectedMarkerId: string | null;
}

function addVenueLayers(map: mapboxgl.Map) {
  if (map.getSource(VENUES_SOURCE_ID)) return;

  map.addSource(VENUES_SOURCE_ID, {
    type: "geojson",
    data: { type: "FeatureCollection", features: [] },
  });

  map.addLayer({
    id: VENUE_PINS_LAYER_ID,
    type: "circle",
    source: VENUES_SOURCE_ID,
    paint: {
      "circle-radius": 7,
      "circle-color": "#C9F31D",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#0d0d0d",
    },
  });

  map.addLayer({
    id: VENUE_PINS_SELECTED_LAYER_ID,
    type: "circle",
    source: VENUES_SOURCE_ID,
    filter: ["==", ["get", "id"], ""],
    paint: {
      "circle-radius": 10,
      "circle-color": "#C9F31D",
      "circle-stroke-width": 2,
      "circle-stroke-color": "#0d0d0d",
    },
  });
}

export function MapOverlayLayout({
  markers,
  onMarkerClick,
  selectedMarkerId,
}: MapOverlayLayoutProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef(markers);
  const onSelectRef = useRef(onMarkerClick);
  const [layersReady, setLayersReady] = useState(false);

  markersRef.current = markers;
  onSelectRef.current = onMarkerClick;

  useEffect(() => {
    const container = mapContainer.current;
    if (!container || map.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) return;

    let resizeObserver: ResizeObserver | null = null;

    const initMap = () => {
      if (!mapContainer.current || map.current) return;

      const { offsetWidth, offsetHeight } = mapContainer.current;
      if (offsetWidth === 0 || offsetHeight === 0) {
        requestAnimationFrame(initMap);
        return;
      }

      mapboxgl.accessToken = token;

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: GLASGOW_CENTER,
        zoom: GLASGOW_ZOOM,
        pitch: 0,
        attributionControl: false,
      });

      map.current.addControl(
        new mapboxgl.NavigationControl({ showCompass: false }),
        "top-right",
      );

      const resizeMap = () => map.current?.resize();
      const mapInstance = map.current;

      mapInstance.on("load", () => {
        addVenueLayers(mapInstance);

        const source = mapInstance.getSource(
          VENUES_SOURCE_ID,
        ) as mapboxgl.GeoJSONSource;
        source.setData(markersToVenuesGeoJSON(markersRef.current));
        setLayersReady(true);

        resizeMap();
        requestAnimationFrame(resizeMap);
      });

      mapInstance.on("click", VENUE_PINS_LAYER_ID, (e) => {
        const feature = e.features?.[0];
        if (!feature?.properties) return;

        const marker = geoJsonPropertiesToMarker(
          feature.properties,
          markersRef.current,
        );
        if (marker) {
          onSelectRef.current(marker);
        }
      });

      mapInstance.on("mouseenter", VENUE_PINS_LAYER_ID, () => {
        mapInstance.getCanvas().style.cursor = "pointer";
      });

      mapInstance.on("mouseleave", VENUE_PINS_LAYER_ID, () => {
        mapInstance.getCanvas().style.cursor = "";
      });

      mapInstance.on("click", (e) => {
        const features = mapInstance.queryRenderedFeatures(e.point, {
          layers: [VENUE_PINS_LAYER_ID, VENUE_PINS_SELECTED_LAYER_ID],
        });
        if (features.length === 0) {
          onSelectRef.current(null);
        }
      });

      resizeObserver = new ResizeObserver(() => resizeMap());
      resizeObserver.observe(mapContainer.current);
    };

    initMap();

    return () => {
      resizeObserver?.disconnect();
      setLayersReady(false);
      map.current?.remove();
      map.current = null;
    };
  }, []);

  useEffect(() => {
    if (!map.current || !layersReady) return;

    const source = map.current.getSource(VENUES_SOURCE_ID) as
      | mapboxgl.GeoJSONSource
      | undefined;

    if (!source) return;

    source.setData(markersToVenuesGeoJSON(markers));
  }, [markers, layersReady]);

  useEffect(() => {
    if (!map.current || !layersReady) return;
    if (!map.current.getLayer(VENUE_PINS_SELECTED_LAYER_ID)) return;

    if (selectedMarkerId) {
      map.current.setFilter(VENUE_PINS_LAYER_ID, [
        "!=",
        ["get", "id"],
        selectedMarkerId,
      ]);
      map.current.setFilter(VENUE_PINS_SELECTED_LAYER_ID, [
        "==",
        ["get", "id"],
        selectedMarkerId,
      ]);
    } else {
      map.current.setFilter(VENUE_PINS_LAYER_ID, null);
      map.current.setFilter(VENUE_PINS_SELECTED_LAYER_ID, [
        "==",
        ["get", "id"],
        "",
      ]);
    }
  }, [selectedMarkerId]);

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div
      className="relative w-full overflow-hidden rounded-t-xl"
      style={{ height: "55vh", minHeight: 280 }}
    >
      <div
        ref={mapContainer}
        className="absolute inset-0 h-full w-full"
        style={{ width: "100%", height: "100%" }}
      />

      <div className="pointer-events-none absolute bottom-4 left-4 z-10">
        <div className="flex items-center gap-1.5 rounded-full border border-[#2a2a2a]/50 bg-[#161616]/90 px-2.5 py-1 backdrop-blur-md">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#C9F31D]" />
          <span className="text-[10px] font-medium uppercase tracking-wide text-[#666666]">
            {markers.length} venues
          </span>
        </div>
      </div>

      {!hasToken && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-[#161616]/50 backdrop-blur-sm">
          <div className="mx-4 rounded-xl border border-[#2a2a2a] bg-[#161616]/90 p-4 text-center backdrop-blur-md">
            <MapPin className="mx-auto mb-2 h-10 w-10 text-[#C9F31D]" />
            <p className="text-xs text-[#666666]">
              Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
