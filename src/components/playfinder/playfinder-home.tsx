"use client";

import { ComposeRow } from "@/components/playfinder/compose-row";
import { LiveActivityBar } from "@/components/playfinder/live-activity-bar";
import { PlayFinderFeed } from "@/components/playfinder/playfinder-feed";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import { SportTabs } from "@/components/playfinder/sport-tabs";
import { useState } from "react";

export function PlayFinderHome() {
  const { openBroadcast } = usePlayFinder();
  const [sportFilter, setSportFilter] = useState("all");

  return (
    <>
      <SportTabs activeTab={sportFilter} onTabChange={setSportFilter} />
      <LiveActivityBar />
      <ComposeRow onBroadcast={openBroadcast} />
      <PlayFinderFeed sportFilter={sportFilter} />
    </>
  );
}
