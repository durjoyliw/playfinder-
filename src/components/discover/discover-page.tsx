"use client";

import {
  MapOverlayLayout,
  type MapMarker,
} from "@/components/discover/map-overlay-layout";
import { PlayersNearYouFeed } from "@/components/discover/players-near-you-feed";
import { SportPillSelector } from "@/components/discover/sport-pill-selector";
import { VenueBottomSheet } from "@/components/discover/venue-bottom-sheet";
import type { DiscoverSportFilterId } from "@/lib/discover";
import {
  venueMatchesSportFilter,
  venueToMapMarker,
} from "@/lib/discover-markers";
import { DISCOVER_SPORT_FILTERS } from "@/lib/discover";
import { DISCOVER_VENUES } from "@/lib/venues";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

const MapOverlayLayoutDynamic = dynamic(
  () =>
    import("@/components/discover/map-overlay-layout").then(
      (m) => m.MapOverlayLayout,
    ),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-[55vh] min-h-[240px] items-center justify-center rounded-t-xl bg-[#161616] text-sm text-[#666666]">
        Loading map…
      </div>
    ),
  },
);

export function DiscoverPage() {
  const [selectedSport, setSelectedSport] =
    useState<DiscoverSportFilterId>("all");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);

  const sportLabel =
    DISCOVER_SPORT_FILTERS.find((f) => f.id === selectedSport)?.label ?? null;

  const markers = useMemo(() => {
    const filtered = DISCOVER_VENUES.filter((venue) =>
      venueMatchesSportFilter(venue, sportLabel === "All" ? null : sportLabel),
    );
    return filtered.map((venue, index) =>
      venueToMapMarker(venue, `${venue.name}-${index}`),
    );
  }, [sportLabel]);

  const selectedMarker = useMemo(
    () => markers.find((m) => m.id === selectedMarkerId) ?? null,
    [markers, selectedMarkerId],
  );

  useEffect(() => {
    setSelectedMarkerId(null);
  }, [selectedSport]);

  const handleMarkerClick = useCallback((marker: MapMarker | null) => {
    setSelectedMarkerId(marker?.id ?? null);
  }, []);

  const handleCloseSheet = useCallback(() => {
    setSelectedMarkerId(null);
  }, []);

  const handleBook = useCallback(() => {
    if (selectedMarker?.url) {
      window.open(selectedMarker.url, "_blank", "noopener,noreferrer");
    }
  }, [selectedMarker?.url]);

  return (
    <div className="mx-auto flex w-full max-w-[600px] flex-col bg-[#0d0d0d]">
      <MapOverlayLayoutDynamic
        markers={markers}
        onMarkerClick={handleMarkerClick}
        selectedMarkerId={selectedMarkerId}
      />

      <SportPillSelector
        selectedSport={selectedSport}
        onSelectSport={setSelectedSport}
        activeCount={markers.length}
      />

      {selectedMarker && (
        <VenueBottomSheet
          marker={selectedMarker}
          onClose={handleCloseSheet}
          onBook={handleBook}
        />
      )}

      <PlayersNearYouFeed selectedSport={selectedSport} />
    </div>
  );
}
