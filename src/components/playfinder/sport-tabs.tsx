"use client";

import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import { getSportIcon } from "@/lib/discover-sport-icons";
import { cn } from "@/lib/utils";
import { Zap } from "lucide-react";

interface SportTabsProps {
  tabs: FeedSportTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function SportTabs({ tabs, activeTab, onTabChange }: SportTabsProps) {
  return (
    <div className="min-w-0 bg-[#08090a] pt-[18px]">
      <div
        id="sport-tabs-scroll"
        role="tablist"
        aria-label="Filter by sport"
        className="flex gap-2 overflow-x-auto px-4 py-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {tabs.map((sport) => {
          const isActive = activeTab === sport.id;
          const SportIcon = getSportIcon(sport.id);

          return (
            <button
              key={sport.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(sport.id)}
              className={cn(
                "flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[14px] border px-4 py-[11px] text-[13px] font-semibold transition-all duration-200 ease-[cubic-bezier(.2,.8,.2,1)] active:scale-95",
                isActive
                  ? "border-[#c9f31d] bg-[#c9f31d] text-[#0a0b0a]"
                  : "border-[#2a2f2a] bg-[#131614] text-[#b4bcaf]",
              )}
              style={
                isActive
                  ? { boxShadow: "0 4px 20px var(--pf-volt-glow)" }
                  : undefined
              }
            >
              {sport.id === "all" ? (
                <Zap className="h-4 w-4" />
              ) : (
                <SportIcon className="h-4 w-4" />
              )}
              {sport.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
