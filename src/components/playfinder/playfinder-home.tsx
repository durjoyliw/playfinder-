"use client";

import { ComposeRow } from "@/components/playfinder/compose-row";
import { FeedTypeTabs } from "@/components/playfinder/feed-type-tabs";
import { LiveActivityBar } from "@/components/playfinder/live-activity-bar";
import { PlayFinderFeed } from "@/components/playfinder/playfinder-feed";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import { SportTabs } from "@/components/playfinder/sport-tabs";
import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import { useEffect, useState } from "react";

interface PlayFinderHomeProps {
  feedSportTabs: FeedSportTab[];
}

export function PlayFinderHome({ feedSportTabs }: PlayFinderHomeProps) {
  const { openBroadcast } = usePlayFinder();
  const [sportFilter, setSportFilter] = useState("all");
  const { activeFeedTypeTab, setActiveFeedTypeTab } = usePlayFinder();
  const feedTypeTab = activeFeedTypeTab;
  const setFeedTypeTab = setActiveFeedTypeTab;

  useEffect(() => {
    const validIds = new Set(feedSportTabs.map((t) => t.id));
    if (!validIds.has(sportFilter)) {
      setSportFilter("all");
    }
  }, [feedSportTabs, sportFilter]);

  return (
    <div className="bg-[#0d0d0d]">
      <SportTabs
        tabs={feedSportTabs}
        activeTab={sportFilter}
        onTabChange={setSportFilter}
      />
      <LiveActivityBar />
      <ComposeRow onBroadcast={openBroadcast} />
      <FeedTypeTabs activeTab={feedTypeTab} onTabChange={setFeedTypeTab} />
      <PlayFinderFeed sportFilter={sportFilter} feedTypeTab={feedTypeTab} />
    </div>
  );
}
