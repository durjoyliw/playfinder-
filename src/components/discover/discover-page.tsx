"use client";

import { DiscoverMap } from "@/components/discover/discover-map";
import { DiscoverPlaceList } from "@/components/discover/discover-place-list";
import {
  DiscoverVenueClubTabs,
  VenueBottomSheet,
} from "@/components/discover/venue-bottom-sheet";
import {
  GLASGOW_CENTER,
  type DiscoverPlace,
  type DiscoverTabType,
} from "@/lib/discover-places";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { getSportColour } from "@/lib/sport-visuals";
import { useHorizontalScroll } from "@/hooks/use-horizontal-scroll";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Zap } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export interface DiscoverUserSport {
  id: string;
  name: string;
}

interface DiscoverPageProps {
  userSports: DiscoverUserSport[];
}

export function DiscoverPage({ userSports }: DiscoverPageProps) {
  const [activeSportId, setActiveSportId] = useState(
    () => userSports[0]?.id ?? "running",
  );
  const [activeTab, setActiveTab] = useState<DiscoverTabType>("venues");
  const mapAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (userSports.length === 0) return;
    if (!userSports.some((s) => s.id === activeSportId)) {
      setActiveSportId(userSports[0].id);
    }
  }, [userSports, activeSportId]);

  const activeSport =
    userSports.find((s) => s.id === activeSportId) ?? userSports[0];
  const sportName = activeSport?.name ?? "Running";

  const { data, status, isFetching } = useQuery({
    queryKey: ["discover-places", activeTab, activeSportId],
    queryFn: () =>
      kyInstance
        .get("/api/discover", {
          searchParams: {
            type: activeTab,
            sport: activeSportId,
            lat: GLASGOW_CENTER.lat,
            lng: GLASGOW_CENTER.lng,
          },
        })
        .json<DiscoverPlace[]>(),
    enabled: userSports.length > 0,
  });

  const places = data ?? [];
  const loading = status === "pending" || isFetching;

  if (userSports.length === 0) {
    return (
      <div className="bg-[var(--pf-c-fill-08090a)] px-4 py-8 text-center">
        <p className="text-sm text-[var(--pf-c-ink-7e8a7e)]">
          Add sports in onboarding to discover venues near you.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={mapAreaRef}
      className="relative flex h-full w-full overflow-hidden bg-[var(--pf-c-fill-08090a)]"
    >
      {/* Desktop: results list column */}
      <div className="hidden h-full w-[420px] shrink-0 flex-col border-r border-[var(--pf-c-line-2a2f2a)] lg:flex">
        <div className="shrink-0 border-b border-[var(--pf-c-line-2a2f2a)] px-5 pb-4 pt-5">
          <DiscoverSportPills
            sports={userSports}
            activeSportId={activeSportId}
            onSelect={setActiveSportId}
          />
        </div>
        <DiscoverVenueClubTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          nearbyCount={places.length}
        />
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <DiscoverPlaceList
            places={places}
            tabType={activeTab}
            sportKey={activeSportId}
            loading={loading}
          />
        </div>
      </div>

      {/* Map: full-bleed on mobile, remaining width on desktop */}
      <div className="relative h-full min-w-0 flex-1">
        <DiscoverMap
          places={places}
          tabType={activeTab}
          sportLabel={sportName}
          sportKey={activeSportId}
          loading={loading}
          fullScreen
        />

        <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-3 pt-3 lg:hidden">
          {/* Only the sport filter pills sit on top of the map. */}
          <div className="pointer-events-auto">
            <DiscoverSportPills
              sports={userSports}
              activeSportId={activeSportId}
              onSelect={setActiveSportId}
            />
          </div>
        </div>
      </div>

      {/* Mobile: draggable bottom sheet */}
      <div className="lg:hidden">
        <VenueBottomSheet
          boundsRef={mapAreaRef}
          places={places}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          loading={loading}
          sportKey={activeSportId}
        />
      </div>
    </div>
  );
}

function DiscoverSportPills({
  sports,
  activeSportId,
  onSelect,
}: {
  sports: DiscoverUserSport[];
  activeSportId: string;
  onSelect: (id: string) => void;
}) {
  const { scrollRef, onMouseDown, wasDragged } =
    useHorizontalScroll<HTMLDivElement>();

  return (
    <div
      ref={scrollRef}
      onMouseDown={onMouseDown}
      className={cn(
        "flex select-none gap-[7px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        "cursor-grab active:cursor-grabbing",
      )}
    >
      {sports.map((sport) => {
        const isActive = sport.id === activeSportId;
        const SportIcon = getSportIcon(sport.id);
        // "All" follows the accent; sport chips keep their own fixed colours.
        const isAllChip = sport.id === "all";
        const chipColour = isAllChip
          ? "var(--pf-volt)"
          : getSportColour(sport.id);
        const chipGlow = isAllChip
          ? "rgb(var(--pf-volt-rgb) / 0.3)"
          : `${chipColour}4d`;
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => {
              if (wasDragged()) return;
              onSelect(sport.id);
            }}
            className={cn(
              "flex min-h-[34px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full border px-[13px] py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 active:scale-95",
              isActive
                ? cn(
                    "border-transparent",
                    isAllChip ? "text-[var(--pf-on-accent)]" : "text-[#0a0b0a]",
                  )
                : "border-[var(--pf-c-line-2a2f2a)] bg-[rgb(var(--pf-c-fill-131614-rgb)/0.88)] text-[var(--pf-c-ink-7e8a7e)] hover:border-[var(--pf-c-line-353c34)]",
            )}
            style={
              isActive
                ? {
                    background: chipColour,
                    boxShadow: `0 2px 12px ${chipGlow}`,
                  }
                : undefined
            }
          >
            {sport.id === "all" ? (
              <Zap className="h-[15px] w-[15px]" />
            ) : (
              <SportIcon className="h-[15px] w-[15px]" />
            )}
            <span>{sport.name}</span>
          </button>
        );
      })}
    </div>
  );
}
