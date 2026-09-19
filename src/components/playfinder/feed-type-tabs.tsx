"use client";

import { SlidingPillTabs } from "@/components/playfinder/sliding-pill-tabs";
import type { FeedTypeTab } from "@/lib/feed-type-tabs";

const TABS = [
  // Visual order: SOCIAL (left) then ARENA (right). IDs/logic unchanged.
  { id: "posts" as const, label: "Social" },
  { id: "players" as const, label: "Arena" },
];

interface FeedTypeTabsProps {
  activeTab: FeedTypeTab;
  onTabChange: (tab: FeedTypeTab) => void;
}

export function FeedTypeTabs({ activeTab, onTabChange }: FeedTypeTabsProps) {
  const isArena = activeTab === "players" || activeTab === "teams";

  return (
    <SlidingPillTabs
      tabs={TABS}
      activeId={isArena ? "players" : "posts"}
      onTabChange={(id) => onTabChange(id)}
      ariaLabel="Feed type"
      activePillClassName={isArena ? "bg-[#56ccf2]" : "bg-[#a1c217]"}
    />
  );
}
