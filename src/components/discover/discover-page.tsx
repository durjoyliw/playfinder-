"use client";

import { DiscoverMap } from "@/components/discover/discover-map";
import { VenueBottomSheet } from "@/components/discover/venue-bottom-sheet";
import {
  GLASGOW_CENTER,
  type DiscoverPlace,
  type DiscoverTabType,
} from "@/lib/discover-places";
import kyInstance from "@/lib/ky";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
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
      <div className="bg-black px-4 py-8 text-center">
        <p className="text-sm text-[#888888]">
          Add sports in onboarding to discover venues near you.
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
      <DiscoverMap
        places={places}
        tabType={activeTab}
        sportLabel={sportName}
        loading={loading}
        fullScreen
      />

      <div className="pointer-events-none absolute left-0 right-0 top-0 z-10 bg-gradient-to-b from-black/90 via-black/50 to-transparent pb-4 pt-[max(1rem,env(safe-area-inset-top))]">
        <div className="pointer-events-auto px-4">
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
    <div className="overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2">
        {sports.map((sport) => {
          const isActive = sport.id === activeSportId;
          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onSelect(sport.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full px-4 py-2 text-[13px] transition-colors",
                isActive
                  ? "bg-[#C9F31D] font-bold text-black shadow-lg"
                  : "border border-zinc-700 bg-zinc-900/80 font-medium text-white backdrop-blur-md",
              )}
            >
              {sport.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
