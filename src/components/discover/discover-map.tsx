"use client";

import {
  formatDistanceMiles,
  GLASGOW_CENTER,
  type DiscoverPlace,
  type DiscoverTabType,
} from "@/lib/discover-places";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

interface DiscoverMapProps {
  places: DiscoverPlace[];
  tabType: DiscoverTabType;
  sportLabel: string;
  loading: boolean;
  error: string | null;
}

const GLASGOW_CENTER_LNG_LAT: [number, number] = [
  GLASGOW_CENTER.lng,
  GLASGOW_CENTER.lat,
];

export function DiscoverMap({
  places,
  tabType,
  sportLabel,
  loading,
  error,
}: DiscoverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token || !mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: GLASGOW_CENTER_LNG_LAT,
      zoom: 12,
      attributionControl: false,
    });

    const nav = new mapboxgl.NavigationControl({ showCompass: false });
    map.addControl(nav, "top-right");

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      popupRef.current?.remove();
      popupRef.current = null;
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    popupRef.current?.remove();
    popupRef.current = null;

    const isVenue = tabType === "venues";
    const markerColor = isVenue ? "#C9F31D" : "#378ADD";
    const borderColor = isVenue ? "#000000" : "#ffffff";

    for (const place of places) {
      const el = document.createElement("button");
      el.type = "button";
      el.setAttribute("aria-label", place.name);
      el.style.width = "14px";
      el.style.height = "14px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = markerColor;
      el.style.border = `2px solid ${borderColor}`;
      el.style.cursor = "pointer";
      el.style.padding = "0";

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        popupRef.current?.remove();
        const popup = new mapboxgl.Popup({
          closeButton: false,
          offset: 12,
          className: "discover-map-popup",
        })
          .setLngLat([place.lng, place.lat])
          .setHTML(
            `<div style="font-size:12px;font-weight:700;color:#fff;margin-bottom:2px">${escapeHtml(place.name)}</div>
             <div style="font-size:11px;color:#C9F31D;font-weight:600">${formatDistanceMiles(place.distanceMiles)}</div>`,
          )
          .addTo(map);
        popupRef.current = popup;
      });

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map);
      markersRef.current.push(marker);
    }
  }, [places, tabType]);

  const countLabel = tabType === "venues" ? "venues" : "clubs";
  const pillText = loading
    ? `Loading ${countLabel}...`
    : `${places.length} ${countLabel} · ${sportLabel}`;

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div
      className="relative mx-4 overflow-hidden rounded-xl"
      style={{ height: 200 }}
    >
      <style>{`
        .mapboxgl-ctrl-group {
          background: #1a1a1a !important;
          border: 1px solid #333 !important;
          border-radius: 8px !important;
          box-shadow: none !important;
        }
        .mapboxgl-ctrl-group button {
          background: #1a1a1a !important;
          border-color: #333 !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid #333 !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1);
        }
        .discover-map-popup .mapboxgl-popup-content {
          background: #161616;
          border: 1px solid #333;
          border-radius: 8px;
          padding: 8px 10px;
        }
        .discover-map-popup .mapboxgl-popup-tip {
          border-top-color: #161616;
        }
      `}</style>

      {hasToken ? (
        <div ref={mapContainerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#161616] px-4 text-center text-xs text-[#888888]">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="rounded-lg border border-[#333] bg-[rgba(0,0,0,0.75)] px-2.5 py-1 text-xs text-[#888888]">
            Loading {countLabel}...
          </span>
        </div>
      )}

      {error && !loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-[#0d0d0d]/60">
          <span className="text-sm text-[#888888]">{error}</span>
        </div>
      )}

      {hasToken && !loading && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10">
          <span
            className="rounded-lg border border-[#333] text-xs text-white"
            style={{
              background: "rgba(0,0,0,0.75)",
              padding: "5px 10px",
            }}
          >
            {pillText}
          </span>
        </div>
      )}
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
