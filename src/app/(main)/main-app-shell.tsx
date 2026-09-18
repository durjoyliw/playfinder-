"use client";

import { BottomNav } from "@/components/playfinder/bottom-nav";
import { DesktopRightRail } from "@/components/playfinder/desktop-right-rail";
import { DesktopSidebar } from "@/components/playfinder/desktop-sidebar";
import { Header } from "@/components/playfinder/header";
import { ProfileDesktopRightRail } from "@/components/playfinder-profile/profile-desktop-right-rail";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

interface MainAppShellProps {
  children: React.ReactNode;
  initialUnreadNotificationCount: number;
}

/**
 * The desktop chrome (left nav + right rail) lives here, once, so it never
 * remounts while navigating between pages inside this route group -- only
 * the middle column and the right rail's contents change, the same way
 * X's shell works. Discover (its map) and Messages (its list + thread
 * split) are the exception: their own content already fills the middle +
 * right area, so they render full-bleed instead of a capped column with a
 * separate widgets rail.
 */
export function MainAppShell({
  children,
  initialUnreadNotificationCount,
}: MainAppShellProps) {
  const pathname = usePathname();
  const isMessagesRoute = pathname.startsWith("/messages");
  const isDiscoverRoute = pathname.startsWith("/discover");
  const isProfileRoute = pathname.startsWith("/users/");

  const isFullBleedRoute = isMessagesRoute || isDiscoverRoute;
  // Every non-full-bleed route shares the same 600px content column, so the
  // sidebar and right rail sit at the exact same position on every page --
  // Settings/Notifications used to fall back to the narrower 480px column,
  // which shifted the rail inward and made it look like the "static" side
  // panels were shrinking as you navigated.
  const isWideColumnRoute = !isFullBleedRoute;

  const rightRail = isFullBleedRoute ? null : isProfileRoute ? (
    <ProfileDesktopRightRail />
  ) : (
    <DesktopRightRail />
  );

  return (
    <div className="flex min-h-screen bg-[#08090a] font-grotesk text-[#f2f5ef] lg:px-[max(24px,calc((100vw_-_1225px)_/_2))]">
      <DesktopSidebar
        initialUnreadNotificationCount={initialUnreadNotificationCount}
        collapsed={isFullBleedRoute}
      />

      {isFullBleedRoute ? (
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
      ) : (
        <div
          className={cn(
            "relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col lg:mx-0 lg:border-x lg:border-[#2a2f2a]",
            isWideColumnRoute && "lg:max-w-[600px]",
          )}
        >
          <Header
            initialUnreadNotificationCount={initialUnreadNotificationCount}
          />
          <main className={cn("flex-1 overflow-y-auto pb-28")}>{children}</main>
          <div className="lg:hidden">
            <BottomNav />
          </div>
        </div>
      )}

      {rightRail}
    </div>
  );
}
