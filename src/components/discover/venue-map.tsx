"use client";

import {
  DISCOVER_VENUES,
  GLASGOW_MAP_CENTER,
  type Venue,
} from "@/lib/venues";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { useEffect, useRef, useState } from "react";

interface VenueMapProps {
  onSelectVenue: (venue: Venue | null) => void;
  selectedVenue: Venue | null;
}

export function VenueMap({ onSelectVenue, selectedVenue }: VenueMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);

  const onSelectRef = useRef(onSelectVenue);
  onSelectRef.current = onSelectVenue;

  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setMapError("Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local");
      return;
    }

    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: GLASGOW_MAP_CENTER,
      zoom: 11,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");

    markersRef.current = DISCOVER_VENUES.map((venue) => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "venue-map-pin";
      el.setAttribute("aria-label", venue.name);
      el.style.width = "12px";
      el.style.height = "12px";
      el.style.borderRadius = "50%";
      el.style.backgroundColor = "#C9F31D";
      el.style.border = "2px solid #0d0d0d";
      el.style.cursor = "pointer";
      el.style.padding = "0";
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        onSelectRef.current(venue);
      });

      return new mapboxgl.Marker({ element: el })
        .setLngLat([venue.lng, venue.lat])
        .addTo(map);
    });

    map.on("click", () => onSelectRef.current(null));
    map.on("load", () => map.resize());

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      {mapError ? (
        <div className="flex h-full items-center justify-center bg-[#161616] px-6 text-center text-sm text-[#666666]">
          {mapError}
        </div>
      ) : (
        <div ref={mapContainerRef} className="h-full w-full" />
      )}

      {selectedVenue && (
        <VenueCard venue={selectedVenue} onClose={() => onSelectVenue(null)} />
      )}
    </div>
  );
}

function VenueCard({
  venue,
  onClose,
}: {
  venue: Venue;
  onClose: () => void;
}) {
  return (
    <>
      <button
        type="button"
        className="absolute inset-0 z-[5] bg-black/40"
        aria-label="Close venue details"
        onClick={onClose}
      />
      <div className="absolute bottom-0 left-0 right-0 z-10 animate-in slide-in-from-bottom rounded-t-2xl border border-[#2a2a2a] bg-[#161616] p-4 shadow-xl duration-300">
        <h3 className="text-base font-bold text-[#f0f0f0]">{venue.name}</h3>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {venue.sports.map((sport) => (
            <span
              key={sport}
              className="rounded-full border border-[#C9F31D] px-2 py-0.5 text-[10px] font-medium text-[#C9F31D]"
            >
              {sport}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-[#666666]">{venue.address}</p>
        <a
          href={venue.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex w-full items-center justify-center rounded-lg bg-[#C9F31D] py-2.5 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a]"
        >
          Book / Info →
        </a>
      </div>
    </>
  );
}
