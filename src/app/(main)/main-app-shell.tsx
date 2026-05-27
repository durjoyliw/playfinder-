"use client";

import { BottomNav } from "@/components/playfinder/bottom-nav";
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

  if (isMessagesRoute) {
    return (
      <div className="mx-auto flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-[#0d0d0d]">
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

  return (
    <div className="min-h-screen bg-[#0d0d0d]">
      <div className="relative mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
        <Header
          initialUnreadNotificationCount={initialUnreadNotificationCount}
        />
        <main className={cn("flex-1 overflow-y-auto pb-28")}>{children}</main>
        <BottomNav />
      </div>
    </div>
  );
}
