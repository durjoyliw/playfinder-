"use client";

import {
  GLASGOW_CENTER,
  type DiscoverPlace,
  type DiscoverTabType,
} from "@/lib/discover-places";
import { getSportEmoji } from "@/lib/sports";
import { getSportColour } from "@/lib/sport-visuals";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef } from "react";

interface DiscoverMapProps {
  places: DiscoverPlace[];
  tabType: DiscoverTabType;
  sportLabel: string;
  sportKey?: string;
  loading: boolean;
  fullScreen?: boolean;
}

const GLASGOW_CENTER_LNG_LAT: [number, number] = [
  GLASGOW_CENTER.lng,
  GLASGOW_CENTER.lat,
];

export function DiscoverMap({
  places,
  tabType,
  sportLabel,
  sportKey,
  loading,
  fullScreen = false,
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

    map.on("load", () => map.resize());

    const onResize = () => map.resize();
    window.addEventListener("resize", onResize);

    mapRef.current = map;

    return () => {
      window.removeEventListener("resize", onResize);
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
    const markerColor = isVenue
      ? getSportColour(sportKey ?? sportLabel)
      : "#56ccf2";
    const pinEmoji = isVenue
      ? getSportEmoji(sportKey ?? sportLabel)
      : "👥";

    for (const place of places) {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "pf-map-marker";
      el.setAttribute("aria-label", place.name);
      el.style.pointerEvents = "auto";
      el.innerHTML = `<div class="pf-map-pin" style="background:${markerColor}"><span class="pf-map-pin-emoji">${pinEmoji}</span></div><div class="pf-map-pulse" style="border-color:${markerColor}"></div>`;

      const marker = new mapboxgl.Marker({ element: el, anchor: "bottom" })
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
        <p style="color:#f2f5ef;font-weight:700;font-size:14px;margin:0 20px 4px 0;">${escapeHtml(place.name)}</p>
        ${place.address ? `<p style="color:#7e8a7e;font-size:12px;margin:0 0 6px;">${escapeHtml(place.address)}</p>` : ""}
        ${place.sports?.length ? `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-bottom:6px;">${place.sports.map((s) => `<span style="background:#c9f31d;color:#0a0b0a;font-weight:700;font-size:11px;border-radius:4px;padding:2px 8px;">${escapeHtml(s)}</span>`).join("")}</div>` : ""}
        <p style="color:#c9f31d;font-weight:700;font-size:12px;margin:0 0 6px;">${place.distanceMiles} mi</p>
        ${openStatusHtml}
        <div style="display:flex;gap:8px;margin-top:10px;">
          <a href="https://maps.google.com/?q=${place.lat},${place.lng}" target="_blank" rel="noopener noreferrer" style="background:#1a1e1b;border:1px solid #2a2f2a;border-radius:8px;padding:7px 12px;font-size:12px;color:#f2f5ef;text-decoration:none;">Get directions</a>
          ${place.website ? `<a href="${escapeHtml(place.website)}" target="_blank" rel="noopener noreferrer" style="background:#c9f31d;border-radius:8px;padding:7px 12px;font-size:12px;color:#0a0b0a;font-weight:700;text-decoration:none;">Visit website</a>` : ""}
        </div>
      </div>
    `,
          )
          .addTo(map);

        existingPopupRef.current = popup;
      });

      markersRef.current.push(marker);
    }
  }, [places, tabType, sportKey, sportLabel]);

  const countLabel = tabType === "venues" ? "venues" : "clubs";
  const pillText = loading
    ? `Loading ${countLabel}...`
    : `${places.length} ${countLabel} · ${sportLabel}`;

  const hasToken = !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  return (
    <div
      className={
        fullScreen
          ? "absolute inset-0 z-0 h-full w-full overflow-hidden bg-[#0c0e0c]"
          : "relative mx-4 mb-4 h-[420px] overflow-hidden rounded-xl border border-[#2a2f2a]"
      }
    >
      <style>{`
        .mapboxgl-ctrl-group {
          background: rgba(13,15,13,0.9) !important;
          border: 1px solid #2a2f2a !important;
          border-radius: 12px !important;
          box-shadow: none !important;
          overflow: hidden;
        }
        .mapboxgl-ctrl-group button {
          width: 40px !important;
          height: 40px !important;
          background: rgba(13,15,13,0.9) !important;
          border-color: #2a2f2a !important;
        }
        .mapboxgl-ctrl-group button + button {
          border-top: 1px solid #2a2f2a !important;
        }
        .mapboxgl-ctrl-icon {
          filter: invert(1);
        }
        .discover-map-popup .mapboxgl-popup-content {
          background: #131614 !important;
          border: 1px solid #2a2f2a !important;
          border-radius: 16px !important;
          padding: 14px !important;
          box-shadow: 0 10px 40px rgba(0,0,0,0.4) !important;
          min-width: 210px !important;
          max-width: 260px !important;
        }
        .discover-map-popup .mapboxgl-popup-tip {
          display: none !important;
        }
        .discover-map-popup .mapboxgl-popup-close-button {
          color: #7e8a7e !important;
          font-size: 18px !important;
          top: 8px !important;
          right: 10px !important;
          background: transparent !important;
        }
      `}</style>

      {hasToken ? (
        <div ref={mapContainerRef} className="h-full w-full" />
      ) : (
        <div className="flex h-full items-center justify-center bg-[#0c0e0c] px-4 text-center text-xs text-[#7e8a7e]">
          Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
        </div>
      )}

      {loading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/30">
          <span className="rounded-lg border border-[#2a2f2a] bg-[rgba(13,15,13,0.85)] px-2.5 py-1 text-xs text-[#7e8a7e] backdrop-blur-md">
            Loading {countLabel}...
          </span>
        </div>
      )}

      {hasToken && !loading && places.length > 0 && !fullScreen && (
        <div className="pointer-events-none absolute bottom-2 left-2 z-10">
          <span className="rounded-[10px] border border-[#2a2f2a] bg-[rgba(13,15,13,0.85)] px-3 py-1.5 font-dm-mono text-xs text-[#f2f5ef] backdrop-blur-md">
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
