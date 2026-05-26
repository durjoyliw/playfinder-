"use client";

import {
  ComposerSheet,
  type ComposerTab,
} from "@/components/playfinder/composer-sheet";
import type { FeedTypeTab } from "@/lib/feed-type-tabs";
import { createContext, useCallback, useContext, useState } from "react";

interface PlayFinderContextValue {
  openComposer: (defaultTab?: ComposerTab) => void;
  /** @deprecated Use openComposer("arena") */
  openBroadcast: () => void;
  /** @deprecated Use openComposer("social") */
  openSocial: () => void;
  activeFeedTypeTab: FeedTypeTab;
  setActiveFeedTypeTab: (tab: FeedTypeTab) => void;
}

const PlayFinderContext = createContext<PlayFinderContextValue | null>(null);

export function PlayFinderProvider({ children }: { children: React.ReactNode }) {
  const [composerOpen, setComposerOpen] = useState(false);
  const [composerDefaultTab, setComposerDefaultTab] =
    useState<ComposerTab>("arena");
  const [activeFeedTypeTab, setActiveFeedTypeTab] =
    useState<FeedTypeTab>("players");

  const openComposer = useCallback(
    (defaultTab?: ComposerTab) => {
      const tab =
        defaultTab ?? (activeFeedTypeTab === "posts" ? "social" : "arena");
      setComposerDefaultTab(tab);
      setComposerOpen(true);
    },
    [activeFeedTypeTab],
  );

  const openBroadcast = useCallback(() => openComposer("arena"), [openComposer]);
  const openSocial = useCallback(() => openComposer("social"), [openComposer]);

  return (
    <PlayFinderContext.Provider
      value={{
        openComposer,
        openBroadcast,
        openSocial,
        activeFeedTypeTab,
        setActiveFeedTypeTab,
      }}
    >
      {children}
      <ComposerSheet
        open={composerOpen}
        onOpenChange={setComposerOpen}
        defaultTab={composerDefaultTab}
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
