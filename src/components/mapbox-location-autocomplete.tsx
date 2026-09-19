"use client";

import { getMapboxToken, hasMapboxToken } from "@/lib/mapbox-token";
import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

/** Feature shape returned by Mapbox Geocoding (fields we use). */
export interface MapboxGeocodeFeature {
  id: string;
  place_name: string;
  place_type?: string[];
  center?: [number, number];
}

interface MapboxLocationAutocompleteProps {
  value: string;
  /** Called while typing (draft text) */
  onChange: (text: string) => void;
  /** Called when user picks a suggestion — place_name only (settings Location). */
  onPlaceSelect?: (placeName: string) => void;
  /**
   * Full feature on pick — wizard map uses center + place_type for
   * radius (city/area) vs Discover pin (postcode/address).
   */
  onFeatureSelect?: (feature: MapboxGeocodeFeature) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
}

const DEFAULT_INPUT_CLASS =
  "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3.5 text-base text-white placeholder:text-[#6b6b6b] focus:border-[#A1C217] focus:outline-none";

/**
 * Shared Mapbox city/postcode autocomplete used by Settings → Location
 * (`src/app/(main)/settings/location-form.tsx`) and Create-a-Page step 3.
 */
export function MapboxLocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  onFeatureSelect,
  placeholder = "e.g. Glasgow West End, Paisley",
  className,
  inputClassName = DEFAULT_INPUT_CLASS,
  id,
}: MapboxLocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MapboxGeocodeFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Runtime check for step-3 / settings debugging (same var Discover uses).
    // eslint-disable-next-line no-console
    console.log(
      "[MapboxLocationAutocomplete] NEXT_PUBLIC_MAPBOX_TOKEN defined:",
      !!process.env.NEXT_PUBLIC_MAPBOX_TOKEN,
      "hasMapboxToken():",
      hasMapboxToken(),
    );
  }, []);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuggestions = useCallback(async (text: string) => {
    const token = getMapboxToken();
    if (!token || text.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const encoded = encodeURIComponent(text.trim());
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encoded}.json?access_token=${token}&country=gb&types=postcode,place,neighborhood&limit=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Geocoding failed");
      const data = (await res.json()) as { features: MapboxGeocodeFeature[] };
      setSuggestions(data.features ?? []);
      setOpen(true);
    } catch {
      setSuggestions([]);
      setOpen(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (text: string) => {
    setQuery(text);
    onChange(text);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    debounceRef.current = setTimeout(() => {
      fetchSuggestions(text);
    }, 300);
  };

  const selectPlace = (feature: MapboxGeocodeFeature) => {
    setQuery(feature.place_name);
    onChange(feature.place_name);
    onPlaceSelect?.(feature.place_name);
    onFeatureSelect?.(feature);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative z-[30]", className)}>
      <input
        id={id}
        type="text"
        value={query}
        onChange={(e) => handleInputChange(e.target.value)}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        className={inputClassName}
        autoComplete="off"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-[200] mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
          {suggestions.map((feature) => (
            <li key={feature.id}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#262626]"
                onClick={() => selectPlace(feature)}
              >
                {feature.place_name}
              </button>
            </li>
          ))}
        </ul>
      )}
      {loading && (
        <p className="mt-1 text-xs text-gray-500">Searching places…</p>
      )}
    </div>
  );
}
