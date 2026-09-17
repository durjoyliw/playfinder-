"use client";

import { useSession } from "@/app/(main)/SessionProvider";
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

function greetingForHour(hour: number) {
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function PlayFinderHome({ feedSportTabs }: PlayFinderHomeProps) {
  const { user } = useSession();
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

  const firstName = (user.displayName || user.username).split(" ")[0];
  const greeting = greetingForHour(new Date().getHours());

  return (
    <div className="bg-[#08090a]">
      <div className="px-4 pb-1 pt-6">
        <div className="mb-1 text-sm text-[#7e8a7e]">
          {greeting}, {firstName}
        </div>
        <h1 className="text-[clamp(30px,9vw,40px)] font-bold leading-[0.95] tracking-[-0.04em] text-[#f2f5ef]">
          Who&apos;s <span className="text-[#c9f31d]">playing?</span>
        </h1>
      </div>
      <SportTabs
        tabs={feedSportTabs}
        activeTab={sportFilter}
        onTabChange={setSportFilter}
      />
      <LiveActivityBar />
      <ComposeRow onBroadcast={() => openComposer()} />
      <FeedTypeTabs activeTab={feedTypeTab} onTabChange={setFeedTypeTab} />
      <PlayFinderFeed sportFilter={sportFilter} feedTypeTab={feedTypeTab} />
    </div>
  );
}
