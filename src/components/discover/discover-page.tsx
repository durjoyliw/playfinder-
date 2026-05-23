"use client";

import { DiscoverMap } from "@/components/discover/discover-map";
import { DiscoverPlaceList } from "@/components/discover/discover-place-list";
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
    queryKey: ["discover-places", activeTab, sportName],
    queryFn: () =>
      kyInstance
        .get("/api/discover", {
          searchParams: {
            type: activeTab,
            sport: sportName,
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
      <div className="bg-[#0d0d0d] px-4 py-8 text-center">
        <p className="text-sm text-[#888888]">
          Add sports in onboarding to discover venues near you.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden bg-[#0d0d0d] pb-20">
      <DiscoverSportPills
        sports={userSports}
        activeSportId={activeSportId}
        onSelect={setActiveSportId}
      />

      <div style={{ margin: "12px 16px 16px" }}>
        <h2 className="text-[20px] font-bold text-white">
          Explore venues and clubs near you
        </h2>
        <p className="mt-1 text-[14px] text-[#888888]">
          Places to play, based on your sports
        </p>
      </div>

      <DiscoverVenueClubTabs activeTab={activeTab} onTabChange={setActiveTab} />

      <DiscoverMap
        places={places}
        tabType={activeTab}
        sportLabel={sportName}
        loading={loading}
      />

      <DiscoverPlaceList
        places={places}
        tabType={activeTab}
        sportKey={activeSportId}
        loading={loading}
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
    <div
      className="mb-3 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      style={{ padding: "0 16px" }}
    >
      <div className="flex" style={{ gap: 8 }}>
        {sports.map((sport) => {
          const isActive = sport.id === activeSportId;
          return (
            <button
              key={sport.id}
              type="button"
              onClick={() => onSelect(sport.id)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border-none transition-colors",
                isActive
                  ? "bg-[#C9F31D] font-bold text-black"
                  : "bg-[#1a1a1a] font-medium text-[#888888]",
              )}
              style={{ padding: "7px 16px", fontSize: 13 }}
            >
              {sport.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DiscoverVenueClubTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: DiscoverTabType;
  onTabChange: (tab: DiscoverTabType) => void;
}) {
  const tabs: { id: DiscoverTabType; label: string }[] = [
    { id: "venues", label: "Venues" },
    { id: "clubs", label: "Clubs" },
  ];

  return (
    <div className="flex border-b border-[#1f1f1f]">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "flex-1 text-center transition-colors",
              isActive
                ? "border-b-2 border-[#C9F31D] text-white"
                : "text-[#555555]",
            )}
            style={{
              padding: 12,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
