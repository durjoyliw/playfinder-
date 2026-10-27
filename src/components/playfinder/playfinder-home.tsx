"use client";

import { ComposeRow } from "@/components/playfinder/compose-row";
import { FeedTypeTabs } from "@/components/playfinder/feed-type-tabs";
import { LiveActivityBar } from "@/components/playfinder/live-activity-bar";
import { PlayFinderFeed } from "@/components/playfinder/playfinder-feed";
import { usePlayFinder } from "@/components/playfinder/playfinder-provider";
import { SportTabs } from "@/components/playfinder/sport-tabs";
import type { FeedSportTab } from "@/lib/feed-sport-tabs";
import { useSearchParams } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";

interface PlayFinderHomeProps {
  feedSportTabs: FeedSportTab[];
}

export function PlayFinderHome({ feedSportTabs }: PlayFinderHomeProps) {
  const { openComposer } = usePlayFinder();
  const [sportFilter, setSportFilter] = useState("all");
  const { activeFeedTypeTab, setActiveFeedTypeTab } = usePlayFinder();
  const feedTypeTab = activeFeedTypeTab;
  const setFeedTypeTab = setActiveFeedTypeTab;
  const searchParams = useSearchParams();

  useLayoutEffect(() => {
    const tab = searchParams.get("tab") ?? "social";
    setActiveFeedTypeTab(tab === "arena" ? "players" : "posts");
  }, [searchParams, setActiveFeedTypeTab]);

  useEffect(() => {
    const validIds = new Set(feedSportTabs.map((t) => t.id));
    if (!validIds.has(sportFilter)) {
      setSportFilter("all");
    }
  }, [feedSportTabs, sportFilter]);

  return (
    <div className="bg-[var(--pf-c-fill-08090a)]">
      <div className="sticky top-[var(--pf-header-h)] z-20 border-b border-[rgb(var(--pf-contrast-rgb)/0.04)] bg-[rgb(var(--pf-c-fill-08090a-rgb)/0.92)] backdrop-blur-[20px] lg:top-0">
        <SportTabs
          tabs={feedSportTabs}
          activeTab={sportFilter}
          onTabChange={setSportFilter}
        />
        <ComposeRow onBroadcast={() => openComposer()} />
        <FeedTypeTabs activeTab={feedTypeTab} onTabChange={setFeedTypeTab} />
      </div>
      {feedTypeTab === "players" && <LiveActivityBar />}
      <PlayFinderFeed sportFilter={sportFilter} feedTypeTab={feedTypeTab} />
    </div>
  );
}
