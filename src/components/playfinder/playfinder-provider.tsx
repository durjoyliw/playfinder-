"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { BroadcastSheet } from "./broadcast-sheet";
import { SocialComposer } from "./social-composer";
import type { FeedTypeTab } from "@/lib/feed-type-tabs";

interface PlayFinderContextValue {
  openBroadcast: () => void;
  openSocial: () => void;
  openComposer: () => void;
  activeFeedTypeTab: FeedTypeTab;
  setActiveFeedTypeTab: (tab: FeedTypeTab) => void;
}

const PlayFinderContext = createContext<PlayFinderContextValue | null>(null);

export function PlayFinderProvider({ children }: { children: React.ReactNode }) {
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const [socialOpen, setSocialOpen] = useState(false);
  const [activeFeedTypeTab, setActiveFeedTypeTab] =
    useState<FeedTypeTab>("players");

  const openBroadcast = useCallback(() => setBroadcastOpen(true), []);
  const openSocial = useCallback(() => setSocialOpen(true), []);

  const openComposer = useCallback(() => {
    // SOCIAL tab == "posts" in existing IDs
    if (activeFeedTypeTab === "posts") {
      setSocialOpen(true);
      return;
    }
    setBroadcastOpen(true);
  }, [activeFeedTypeTab]);

  return (
    <PlayFinderContext.Provider
      value={{
        openBroadcast,
        openSocial,
        openComposer,
        activeFeedTypeTab,
        setActiveFeedTypeTab,
      }}
    >
      {children}
      <BroadcastSheet open={broadcastOpen} onOpenChange={setBroadcastOpen} />
      <SocialComposer
        open={socialOpen}
        onOpenChange={setSocialOpen}
        onSwitchToArena={() => setBroadcastOpen(true)}
      />
    </PlayFinderContext.Provider>
  );
}

export function usePlayFinder() {
  const context = useContext(PlayFinderContext);
  if (!context) {
    throw new Error("usePlayFinder must be used within PlayFinderProvider");
  }
  return context;
}
