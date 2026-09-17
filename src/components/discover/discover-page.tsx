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
      <div className="bg-[#08090a] px-4 py-8 text-center">
        <p className="text-sm text-[#7e8a7e]">
          Add sports in onboarding to discover venues near you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex h-full w-full overflow-hidden bg-[#08090a]">
      {/* Desktop: results list column */}
      <div className="hidden h-full w-[420px] shrink-0 flex-col border-r border-[#2a2f2a] lg:flex">
        <div className="shrink-0 border-b border-[#2a2f2a] px-5 pb-4 pt-5">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-[10px] border border-[#2a2f2a] bg-[rgba(19,22,20,0.6)] px-3 py-2 font-dm-mono text-[10px] font-semibold tracking-[0.1em] text-[#b4bcaf]">
            <span className="h-[7px] w-[7px] animate-pf-status-pulse rounded-full bg-[#c9f31d]" />
            GLASGOW LIVE
          </div>
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
        <div className="min-h-0 flex-1 overflow-y-auto">
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
          <div className="pointer-events-auto">
            <div className="mb-2.5 inline-flex items-center gap-1.5 rounded-[10px] border border-[#2a2f2a] bg-[rgba(13,15,13,0.85)] px-3 py-2 font-dm-mono text-[10px] font-semibold tracking-[0.1em] text-[#b4bcaf] backdrop-blur-[10px]">
              <span className="h-[7px] w-[7px] animate-pf-status-pulse rounded-full bg-[#c9f31d]" />
              GLASGOW LIVE
            </div>
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragState = useRef({ down: false, startX: 0, startScroll: 0, dragged: false });

  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    dragState.current = {
      down: true,
      startX: e.clientX,
      startScroll: el.scrollLeft,
      dragged: false,
    };

    const onMouseMove = (moveEvent: MouseEvent) => {
      if (!dragState.current.down || !scrollRef.current) return;
      const delta = moveEvent.clientX - dragState.current.startX;
      if (Math.abs(delta) > 3) dragState.current.dragged = true;
      scrollRef.current.scrollLeft = dragState.current.startScroll - delta;
    };

    const onMouseUp = () => {
      dragState.current.down = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

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
        const chipColour =
          sport.id === "all" ? "#c9f31d" : getSportColour(sport.id);
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => {
              if (dragState.current.dragged) return;
              onSelect(sport.id);
            }}
            className={cn(
              "flex min-h-[34px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full border px-[13px] py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 active:scale-95",
              isActive
                ? "border-transparent text-[#0a0b0a]"
                : "border-[#2a2f2a] bg-[rgba(19,22,20,0.88)] text-[#7e8a7e] hover:border-[#353c34]",
            )}
            style={
              isActive
                ? {
                    background: chipColour,
                    boxShadow: `0 2px 12px ${chipColour}4d`,
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
