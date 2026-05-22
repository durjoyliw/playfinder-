"use client";

import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { NotificationCountInfo } from "@/lib/types";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { IconSettings } from "@tabler/icons-react";
import { Bell, ChevronDown, MapPin } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface HeaderProps {
  initialUnreadNotificationCount: number;
}

export function Header({ initialUnreadNotificationCount }: HeaderProps) {
  const queryClient = useQueryClient();
  const locationRef = useRef<HTMLDivElement>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState("");

  const { data: userSettings } = useUserSettings();

  const { data } = useQuery({
    queryKey: ["unread-notification-count"],
    queryFn: () =>
      kyInstance
        .get("/api/notifications/unread-count")
        .json<NotificationCountInfo>(),
    initialData: { unreadCount: initialUnreadNotificationCount },
    refetchInterval: 60 * 1000,
  });

  const locationMutation = useMutation({
    mutationFn: (location: string) =>
      kyInstance
        .patch("/api/users/profile", {
          json: { location: location.trim() },
        })
        .json<UserSettingsData>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      setLocationOpen(false);
    },
  });

  const displayLocation = getDisplayArea(userSettings?.location);

  useEffect(() => {
    if (locationOpen) {
      setLocationDraft(userSettings?.location ?? "");
    }
  }, [locationOpen, userSettings?.location]);

  useEffect(() => {
    if (!locationOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        locationRef.current &&
        !locationRef.current.contains(event.target as Node)
      ) {
        setLocationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [locationOpen]);

  const handleSaveLocation = () => {
    locationMutation.mutate(locationDraft);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center justify-between">
        <Link href="/" className="text-xl font-bold italic text-[#C9F31D]">
          PlayFinder
        </Link>

        <div className="flex items-center gap-3">
          <div ref={locationRef} className="relative">
            <button
              type="button"
              onClick={() => setLocationOpen((open) => !open)}
              className="flex items-center gap-1.5 rounded-full bg-[#1f1f1f] px-3 py-1.5 text-sm text-white transition-colors hover:bg-[#2a2a2a]"
              aria-expanded={locationOpen}
              aria-haspopup="dialog"
            >
              <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{displayLocation}</span>
              <ChevronDown
                className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${locationOpen ? "rotate-180" : ""}`}
              />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-56 rounded-xl border border-[#2a2a2a] bg-[#161616] p-3 shadow-lg">
                <label
                  htmlFor="header-location"
                  className="mb-1.5 block text-xs text-muted-foreground"
                >
                  Your city or area
                </label>
                <input
                  id="header-location"
                  type="text"
                  value={locationDraft}
                  onChange={(e) => setLocationDraft(e.target.value)}
                  placeholder="e.g. Glasgow, Paisley, Edinburgh"
                  className="mb-2 w-full rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-[#C9F31D] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSaveLocation();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveLocation}
                  disabled={locationMutation.isPending}
                  className="w-full rounded-lg bg-[#C9F31D] py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-60"
                >
                  {locationMutation.isPending ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </div>

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

          <Link
            href="/settings"
            className="rounded-full p-2 transition-colors hover:bg-[#1f1f1f]"
            aria-label="Settings"
          >
            <IconSettings className="h-5 w-5 text-muted-foreground" stroke={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
}
