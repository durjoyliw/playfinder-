"use client";

import { CreateMenu } from "@/components/playfinder/create-menu";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { Bell, Compass, Home, MessageCircle, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItemId = "home" | "discover" | "messages" | "notifications";

interface NavItem {
  id: NavItemId;
  label: string;
  icon: typeof Home;
  href: string;
  isActive: (pathname: string) => boolean;
}

export function BottomNav() {
  const pathname = usePathname();

  // Same query key / endpoint as NotificationsButton + desktop sidebar.
  const { data: notificationCount } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    refetchInterval: 60 * 1000,
  });

  const unreadCount = notificationCount?.unreadCount ?? 0;

  const navItems: NavItem[] = [
    {
      id: "home",
      label: "Home",
      icon: Home,
      href: "/home",
      isActive: (path) => path === "/home",
    },
    {
      id: "discover",
      label: "Discover",
      icon: Compass,
      href: "/discover",
      isActive: (path) => path.startsWith("/discover"),
    },
    {
      id: "messages",
      label: "Messages",
      icon: MessageCircle,
      href: "/messages",
      isActive: (path) => path.startsWith("/messages"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: Bell,
      href: "/notifications",
      isActive: (path) => path.startsWith("/notifications"),
    },
  ];

  const linkClass = (active: boolean) =>
    cn(
      "relative flex h-full min-h-12 w-full flex-1 items-center justify-center transition-colors active:scale-90",
      active ? "text-[#a1c217]" : "text-[#7e8a7e]",
    );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[100] flex h-[calc(64px+env(safe-area-inset-bottom,0px))] shrink-0 items-stretch border-t border-white/[0.05] bg-[rgba(8,9,10,0.95)] pb-[env(safe-area-inset-bottom,0px)] font-grotesk backdrop-blur-[24px]">
      <div className="flex h-full w-full items-stretch">
        {navItems.slice(0, 2).map((item) => {
          const active = item.isActive(pathname);
          return (
            <Link
              key={item.id}
              href={item.href}
              className={linkClass(active)}
              aria-label={item.label}
              aria-current={active ? "page" : undefined}
            >
              <item.icon className="h-6 w-6 shrink-0" />
            </Link>
          );
        })}

        {/* Equal flex-1 slot so + shares the same width rhythm as icon tabs */}
        <div className="flex h-full min-h-12 flex-1 items-center justify-center">
          <CreateMenu>
            <button
              type="button"
              className="-mt-[30px] grid h-14 w-14 shrink-0 place-items-center rounded-full bg-[#A0CC00] text-black transition-transform active:scale-90"
              style={{ boxShadow: "0 0 16px rgba(200,255,0,0.5)" }}
              aria-label="Create"
            >
              <Plus className="h-[26px] w-[26px]" strokeWidth={2.5} />
            </button>
          </CreateMenu>
        </div>

        {navItems.slice(2).map((item) => {
          const active = item.isActive(pathname);
          const showBadge = item.id === "notifications" && unreadCount > 0;
          return (
            <Link
              key={item.id}
              href={item.href}
              className={linkClass(active)}
              aria-label={
                showBadge
                  ? `Notifications, ${unreadCount} unread`
                  : item.label
              }
              aria-current={active ? "page" : undefined}
            >
              <span className="relative inline-flex">
                <item.icon className="h-6 w-6 shrink-0" />
                {showBadge && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#08090a] bg-[#a1c217] px-1 font-dm-mono text-[9px] font-bold text-[#0a0b0a]">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
