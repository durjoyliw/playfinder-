"use client";

import { BottomNav } from "@/components/playfinder/bottom-nav";
import { DesktopSidebar } from "@/components/playfinder/desktop-sidebar";
import { Header } from "@/components/playfinder/header";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface MainAppShellProps {
  children: React.ReactNode;
  initialUnreadNotificationCount: number;
}

export function MainAppShell({
  children,
  initialUnreadNotificationCount,
}: MainAppShellProps) {
  const pathname = usePathname();
  const isMessagesRoute = pathname.startsWith("/messages");
  const isDiscoverRoute = pathname.startsWith("/discover");

  if (isMessagesRoute) {
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-[#08090a] font-grotesk text-[#f2f5ef]">
        <div className="flex-shrink-0">
          <Header
            initialUnreadNotificationCount={initialUnreadNotificationCount}
          />
        </div>
        <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </main>
        <div className="flex-shrink-0 [&>nav]:!relative [&>nav]:!bottom-auto [&>nav]:!left-auto [&>nav]:!right-auto [&>nav]:!z-auto">
          <BottomNav />
        </div>
      </div>
    );
  }

  if (isDiscoverRoute) {
    return (
      <div className="flex min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef] lg:pl-[max(24px,calc((100vw_-_1225px)_/_2))]">
        <DesktopSidebar />
        <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden lg:mx-0 lg:max-w-none lg:min-w-0 lg:flex-1">
          <div className="flex-shrink-0">
            <Header
              initialUnreadNotificationCount={initialUnreadNotificationCount}
            />
          </div>
          <main className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {children}
          </main>
          <div className="flex-shrink-0 [&>nav]:!relative [&>nav]:!bottom-auto [&>nav]:!left-auto [&>nav]:!right-auto [&>nav]:!z-auto lg:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef] lg:pl-[max(24px,calc((100vw_-_1225px)_/_2))]">
      <DesktopSidebar />
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col lg:mx-0 lg:border-x lg:border-[#2a2f2a]">
        <Header
          initialUnreadNotificationCount={initialUnreadNotificationCount}
        />
        <main className={cn("flex-1 overflow-y-auto pb-28")}>{children}</main>
        <div className="lg:hidden">
          <BottomNav />
        </div>
      </div>
    </div>
  );
}
