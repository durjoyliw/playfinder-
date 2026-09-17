"use client";

import { BottomNav } from "@/components/playfinder/bottom-nav";
import { DesktopRightRail } from "@/components/playfinder/desktop-right-rail";
import { DesktopSidebar } from "@/components/playfinder/desktop-sidebar";
import { Header } from "@/components/playfinder/header";
import { PlayFinderProvider } from "@/components/playfinder/playfinder-provider";

interface PlayFinderShellProps {
  children: React.ReactNode;
  initialUnreadNotificationCount: number;
}

function PlayFinderShellInner({
  children,
  initialUnreadNotificationCount,
}: PlayFinderShellProps) {
  return (
    <div className="min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col lg:max-w-[1225px] lg:flex-row lg:items-start lg:justify-center">
        <DesktopSidebar />
        <div className="flex w-full flex-1 flex-col lg:min-w-0 lg:max-w-[600px] lg:border-x lg:border-[#2a2f2a]">
          <Header
            initialUnreadNotificationCount={initialUnreadNotificationCount}
          />
          <main className="flex-1 pb-28 lg:pb-8">{children}</main>
        </div>
        <DesktopRightRail />
        <div className="lg:hidden">
          <BottomNav />
        </div>
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
