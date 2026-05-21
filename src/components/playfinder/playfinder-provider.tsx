"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { BroadcastSheet } from "./broadcast-sheet";

interface PlayFinderContextValue {
  openBroadcast: () => void;
}

const PlayFinderContext = createContext<PlayFinderContextValue | null>(null);

export function PlayFinderProvider({ children }: { children: React.ReactNode }) {
  const [broadcastOpen, setBroadcastOpen] = useState(false);

  const openBroadcast = useCallback(() => setBroadcastOpen(true), []);

  return (
    <PlayFinderContext.Provider value={{ openBroadcast }}>
      {children}
      <BroadcastSheet open={broadcastOpen} onOpenChange={setBroadcastOpen} />
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
