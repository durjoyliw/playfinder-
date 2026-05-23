"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";

interface MapboxFeature {
  id: string;
  place_name: string;
}

interface MapboxLocationAutocompleteProps {
  value: string;
  /** Called while typing (draft text) */
  onChange: (text: string) => void;
  /** Called when user picks a suggestion — use to persist place_name */
  onPlaceSelect?: (placeName: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  id?: string;
}

const DEFAULT_INPUT_CLASS =
  "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3.5 text-base text-white placeholder:text-[#6b6b6b] focus:border-[#C9F31D] focus:outline-none";

export function MapboxLocationAutocomplete({
  value,
  onChange,
  onPlaceSelect,
  placeholder = "e.g. Glasgow West End, Paisley",
  className,
  inputClassName = DEFAULT_INPUT_CLASS,
  id,
}: MapboxLocationAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<MapboxFeature[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
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
      const data = (await res.json()) as { features: MapboxFeature[] };
      setSuggestions(data.features ?? []);
      setOpen(true);
    } catch {
      setSuggestions([]);
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

  const selectPlace = (placeName: string) => {
    setQuery(placeName);
    onChange(placeName);
    onPlaceSelect?.(placeName);
    setSuggestions([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative", className)}>
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
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
          {suggestions.map((feature) => (
            <li key={feature.id}>
              <button
                type="button"
                className="w-full px-4 py-2.5 text-left text-sm text-white hover:bg-[#262626]"
                onClick={() => selectPlace(feature.place_name)}
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
