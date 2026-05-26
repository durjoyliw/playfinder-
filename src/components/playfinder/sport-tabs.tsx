"use client";

import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import type { CSSProperties } from "react";

interface SportTabsProps {
  tabs: FeedSportTab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

const wrapperStyle: CSSProperties = {
  backgroundColor: "#0d0d0d",
  minWidth: 0,
};

const containerStyle: CSSProperties = {
  display: "flex",
  overflowX: "auto",
  gap: 8,
  padding: "10px 12px 8px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  WebkitOverflowScrolling: "touch",
};

export function SportTabs({ tabs, activeTab, onTabChange }: SportTabsProps) {
  return (
    <div style={wrapperStyle}>
      <style>{`#sport-tabs-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div
        id="sport-tabs-scroll"
        role="tablist"
        aria-label="Filter by sport"
        style={containerStyle}
      >
        {tabs.map((sport) => {
          const isActive = activeTab === sport.id;

          const tabStyle: CSSProperties = {
            borderRadius: 9999,
            padding: "7px 16px",
            fontSize: 13,
            fontWeight: isActive ? 700 : 500,
            whiteSpace: "nowrap",
            cursor: "pointer",
            border: "none",
            backgroundColor: isActive ? "#C9F31D" : "#161616",
            color: isActive ? "#000000" : "#888888",
            flexShrink: 0,
          };

          return (
            <button
              key={sport.id}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => onTabChange(sport.id)}
              style={tabStyle}
            >
              {sport.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
