"use client";

import { DiscoverMap } from "@/components/discover/discover-map";
import { VenueBottomSheet } from "@/components/discover/venue-bottom-sheet";
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
import { useEffect, useState } from "react";

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
    <div className="relative h-[100dvh] w-full overflow-hidden bg-[#08090a]">
      <DiscoverMap
        places={places}
        tabType={activeTab}
        sportLabel={sportName}
        sportKey={activeSportId}
        loading={loading}
        fullScreen
      />

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 px-3 pt-3">
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

      <VenueBottomSheet
        places={places}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        loading={loading}
        sportKey={activeSportId}
      />
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
  return (
    <div className="flex gap-[7px] overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {sports.map((sport) => {
        const isActive = sport.id === activeSportId;
        const SportIcon = getSportIcon(sport.id);
        const chipColour =
          sport.id === "all" ? "#c9f31d" : getSportColour(sport.id);
        return (
          <button
            key={sport.id}
            type="button"
            onClick={() => onSelect(sport.id)}
            className={cn(
              "flex min-h-[34px] shrink-0 items-center gap-[5px] whitespace-nowrap rounded-full border px-[13px] py-2 text-xs font-semibold backdrop-blur-md transition-all duration-200 active:scale-95",
              isActive
                ? "border-transparent text-[#0a0b0a]"
                : "border-[#2a2f2a] bg-[rgba(19,22,20,0.88)] text-[#7e8a7e]",
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
