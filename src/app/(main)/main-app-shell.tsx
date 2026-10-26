"use client";

import { pageViewRightRailSlotId } from "@/app/(main)/pages/[handle]/page-desktop-right-rail";
import { BottomNav } from "@/components/playfinder/bottom-nav";
import { DesktopRightRail } from "@/components/playfinder/desktop-right-rail";
import { DesktopSidebar } from "@/components/playfinder/desktop-sidebar";
import { Header } from "@/components/playfinder/header";
import { ProfileDesktopRightRail } from "@/components/playfinder-profile/profile-desktop-right-rail";
import { markInAppNavigation } from "@/hooks/use-safe-back";
import { useVisualViewportVars } from "@/hooks/use-visual-viewport";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface MainAppShellProps {
  children: React.ReactNode;
  initialUnreadNotificationCount: number;
}

/**
 * Sub-pages that draw their own back bar. On mobile they hide the global
 * header so there is only ever one header at the top of the screen.
 */
function hasOwnMobileHeader(pathname: string) {
  return (
    pathname.startsWith("/settings") ||
    pathname.startsWith("/posts/") ||
    pathname === "/pages" ||
    pathname.startsWith("/pages/new") ||
    pathname.startsWith("/teammates") ||
    pathname.startsWith("/search")
  );
}

/**
 * One shell for every route. The desktop chrome (left nav + right rail), the
 * mobile header and the bottom nav are each rendered in exactly one place, so
 * they never remount while navigating -- only the middle column's sizing and
 * the right rail's contents change.
 *
 * Two column modes share the same element:
 * - Document scroll (most routes): the page itself scrolls; the header is
 *   sticky and the bottom nav is fixed. `main` must NOT be a scroll container,
 *   or `position: sticky` inside it stops working.
 * - Full-bleed (Discover, Messages): the column is exactly one viewport tall
 *   and the route scrolls its own inner areas. These also go full width on
 *   desktop instead of a capped column + widgets rail.
 */
export function MainAppShell({
  children,
  initialUnreadNotificationCount,
}: MainAppShellProps) {
  const pathname = usePathname();
  const isMessagesRoute = pathname.startsWith("/messages");
  const isMessageThreadRoute = /^\/messages\/[^/]+/.test(pathname);
  const isDiscoverRoute = pathname.startsWith("/discover");
  const isProfileRoute = pathname.startsWith("/users/");
  const isPageViewRoute =
    pathname.startsWith("/pages/") &&
    pathname !== "/pages/new" &&
    !pathname.startsWith("/pages/new/");

  const isFullBleedRoute = isMessagesRoute || isDiscoverRoute;
  // Desktop-only: a wider column with no widgets rail (create-page wizard).
  const isWideRoute = pathname.startsWith("/pages/new");
  // A chat thread is a focused screen on mobile: its own channel header and
  // composer replace the app header and bottom nav.
  const showMobileHeader =
    !isMessageThreadRoute && !hasOwnMobileHeader(pathname);
  const showBottomNav = !isMessageThreadRoute;

  useVisualViewportVars(isMessageThreadRoute);

  // Lets back buttons know whether there is in-app history to go back to.
  const initialPathname = useRef(pathname);
  useEffect(() => {
    if (pathname !== initialPathname.current) markInAppNavigation();
  }, [pathname]);

  const rightRail = isFullBleedRoute || isWideRoute ? null : isPageViewRoute ? (
    <div
      id={pageViewRightRailSlotId()}
      className="sticky top-0 hidden h-screen w-[350px] shrink-0 xl:block"
    />
  ) : isProfileRoute ? (
    <ProfileDesktopRightRail />
  ) : (
    <DesktopRightRail />
  );

  return (
    <div className="flex min-h-[100dvh] bg-[var(--pf-bg)] font-grotesk text-[var(--pf-text)] lg:px-[max(24px,calc((100vw_-_1225px)_/_2))]">
      <DesktopSidebar
        initialUnreadNotificationCount={initialUnreadNotificationCount}
        collapsed={isFullBleedRoute}
      />

      <div
        className={cn(
          "relative mx-auto flex w-full max-w-[480px] flex-col lg:mx-0",
          isFullBleedRoute
            ? "h-[100dvh] overflow-hidden lg:min-w-0 lg:max-w-none lg:flex-1"
            : cn(
                "min-h-[100dvh] lg:border-x lg:border-[#2a2f2a]",
                isWideRoute ? "lg:max-w-[920px]" : "lg:max-w-[600px]",
              ),
          // Mobile chat thread: pin the column to the visible area so the
          // composer stays just above the keyboard (see useVisualViewportVars).
          isMessageThreadRoute &&
            "max-lg:fixed max-lg:inset-x-0 max-lg:top-[var(--pf-vv-top,0px)] max-lg:h-[var(--pf-vv-height,100dvh)] max-lg:pb-[var(--pf-vv-bottom-pad,env(safe-area-inset-bottom,0px))]",
          // Without the app header, keep content clear of the status bar.
          !showMobileHeader && "pt-[env(safe-area-inset-top,0px)] lg:pt-0",
        )}
      >
        {showMobileHeader && (
          <Header
            initialUnreadNotificationCount={initialUnreadNotificationCount}
          />
        )}
        <main
          className={cn(
            isFullBleedRoute
              ? "flex min-h-0 flex-1 flex-col overflow-hidden"
              : "flex-1 pb-28",
            // Full-bleed content stops above the fixed bottom nav.
            isFullBleedRoute &&
              showBottomNav &&
              "pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0",
          )}
        >
          {children}
        </main>
      </div>

      {rightRail}

      {showBottomNav && (
        <div className="lg:hidden">
          <BottomNav />
        </div>
      )}
    </div>
  );
}
