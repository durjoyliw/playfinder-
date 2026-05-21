"use client";

import { BottomNav } from "@/components/playfinder/bottom-nav";
import { Header } from "@/components/playfinder/header";
import { PlayFinderProvider, usePlayFinder } from "@/components/playfinder/playfinder-provider";

interface PlayFinderShellProps {
  children: React.ReactNode;
  initialUnreadNotificationCount: number;
}

function PlayFinderShellInner({
  children,
  initialUnreadNotificationCount,
}: PlayFinderShellProps) {
  const { openBroadcast } = usePlayFinder();

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-lg flex-col">
        <Header
          initialUnreadNotificationCount={initialUnreadNotificationCount}
        />
        <main className="flex-1 pb-28">{children}</main>
        <BottomNav onBroadcast={openBroadcast} />
      </div>
    </div>
  );
}

export function PlayFinderShell(props: PlayFinderShellProps) {
  return (
    <PlayFinderProvider>
      <PlayFinderShellInner {...props} />
    </PlayFinderProvider>
  );
}
