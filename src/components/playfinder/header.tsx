"use client";

import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import { useQuery } from "@tanstack/react-query";
import { Bell, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";

interface HeaderProps {
  initialUnreadNotificationCount: number;
}

export function Header({ initialUnreadNotificationCount }: HeaderProps) {
  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: { unreadCount: initialUnreadNotificationCount },
    refetchInterval: 60 * 1000,
  });

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold italic text-[#C9F31D]">
          PlayFinder
        </Link>

        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-1.5 rounded-full bg-[#1f1f1f] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#2a2a2a]"
          >
            <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Glasgow</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </button>

          <Link
            href="/notifications"
            className="relative rounded-full p-2 transition-colors hover:bg-[#1f1f1f]"
            aria-label={
              data.unreadCount > 0
                ? `Notifications, ${data.unreadCount} unread`
                : "Notifications"
            }
          >
            <Bell className="h-5 w-5 text-muted-foreground" />
            {data.unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9F31D] px-1 text-[10px] font-bold text-black">
                {data.unreadCount > 9 ? "9+" : data.unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
