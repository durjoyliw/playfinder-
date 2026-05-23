"use client";

import {
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
}: DiscoverMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const existingPopupRef = useRef<mapboxgl.Popup | null>(null);

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
      fitBoundsOptions: { padding: 40 },
    });

    const nav = new mapboxgl.NavigationControl({ showCompass: false });
    map.addControl(nav, "top-right");

    mapRef.current = map;

    return () => {
      existingPopupRef.current?.remove();
      existingPopupRef.current = null;
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    existingPopupRef.current?.remove();
    existingPopupRef.current = null;
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

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
      el.style.pointerEvents = "auto";

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([place.lng, place.lat])
        .addTo(map);

      marker.getElement().addEventListener("click", (e) => {
        e.stopPropagation();
        existingPopupRef.current?.remove();

        const openStatusLabel =
          place.openStatus != null && place.openStatus !== ""
            ? String(place.openStatus)
            : "";
        const openStatusHtml = openStatusLabel
          ? `<span style="background:${openStatusLabel.includes("Open") ? "#1a2a1a" : "#2a1a0a"};color:${openStatusLabel.includes("Open") ? "#4ade80" : "#fb923c"};font-size:11px;border-radius:4px;padding:2px 8px;margin-bottom:8px;display:inline-block;">${escapeHtml(openStatusLabel)}</span>`
          : "";

        const popup = new mapboxgl.Popup({
          closeButton: true,
          closeOnClick: false,
          offset: 25,
          anchor: "bottom",
          className: "discover-map-popup",
          maxWidth: "260px",
        })
          .setLngLat([place.lng, place.lat])
          .setHTML(
            `
      <div style="min-width:210px;max-width:260px;">
        <p style="color:#fff;font-weight:700;font-size:14px;margin:0 20px 4px 0;">${escapeHtml(place.name)}</p>
        ${place.address ? `<p style="color:#888;font-size:12px;margin:0 0 6px;">${escapeHtml(place.address)}</p>` : ""}
        ${place.sports?.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">${place.sports.map((s) => `<span style="background:#C9F31D;color:#000;font-weight:700;font-size:11px;border-radius:4px;padding:2px 8px;">${escapeHtml(s)}</span>`).join("")}</div>` : ""}
        <p style="color:#C9F31D;font-weight:700;font-size:12px;margin:0 0 6px;">${place.distanceMiles} mi</p>
        ${openStatusHtml}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <a href="https://maps.google.com/?q=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" style="background:#1a1a1a;border:1px solid #333;border-radius:8px;padding:7px 12px;font-size:12px;color:#fff;text-decoration:none;">Get directions</a>
          ${place.website ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener noreferrer" style="background:#C9F31D;border-radius:8px;padding:7px 12px;font-size:12px;color:#000;font-weight:700;text-decoration:none;">Visit website</a>` : ""}
        </div>
      </div>
    `,
          )
          .addTo(map);

        existingPopupRef.current = popup;
      });

      markersRef.current.push(marker);
    }
  }, [places, tabType]);

  const countLabel = tabType === "venues" ? "venues" : "clubs";
  const pillText = loading
    ? `Loading ${countLabel}...`
    : `${places.length} ${countLabel} · ${sportLabel}`;

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div className="relative mx-4 mb-4 h-[420px] overflow-hidden rounded-xl border border-[#222222]">
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
          background: #161616 !important;
          border: 1px solid #333 !important;
          border-radius: 12px !important;
          padding: 14px !important;
          box-shadow: none !important;
          min-width: 210px !important;
          max-width: 260px !important;
        }
        .discover-map-popup .mapboxgl-popup-tip {
          display: none !important;
        }
        .discover-map-popup .mapboxgl-popup-close-button {
          color: #666 !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
          background: transparent !important;
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

      {hasToken && !loading && places.length > 0 && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10">
          <span
            className="rounded-lg border border-[#333333] text-xs text-white"
            style={{
              background: "rgba(0,0,0,0.8)",
              padding: "5px 12px",
              fontSize: 12,
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
