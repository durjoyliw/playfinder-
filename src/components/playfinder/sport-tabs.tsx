"use client";

import type { CSSProperties } from "react";

const SPORTS = [
  { id: "all", label: "All" },
  { id: "football", label: "Football" },
  { id: "tennis", label: "Tennis" },
  { id: "basketball", label: "Basketball" },
  { id: "gym", label: "Gym" },
  { id: "running", label: "Running" },
  { id: "swimming", label: "Swimming" },
  { id: "squash", label: "Squash" },
] as const;

interface SportTabsProps {
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
  padding: "8px 16px",
  scrollbarWidth: "none",
  msOverflowStyle: "none",
  WebkitOverflowScrolling: "touch",
};

export function SportTabs({ activeTab, onTabChange }: SportTabsProps) {
  return (
    <div style={wrapperStyle}>
      <style>{`#sport-tabs-scroll::-webkit-scrollbar { display: none; }`}</style>
      <div
        id="sport-tabs-scroll"
        role="tablist"
        aria-label="Filter by sport"
        style={containerStyle}
      >
        {SPORTS.map((sport) => {
          const isActive = activeTab === sport.id;

          const tabStyle: CSSProperties = {
            borderRadius: 20,
            padding: "6px 14px",
            fontSize: 12,
            fontWeight: 600,
            whiteSpace: "nowrap",
            cursor: "pointer",
            border: isActive ? "none" : "1px solid #2a2a2a",
            backgroundColor: isActive ? "#C9F31D" : "#1a1a1a",
            color: isActive ? "#0d0d0d" : "#666",
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
