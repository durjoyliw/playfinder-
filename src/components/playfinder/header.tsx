"use client";

import { MapboxLocationAutocomplete } from "@/components/mapbox-location-autocomplete";
import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { NotificationCountInfo } from "@/lib/types";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconBell,
  IconBolt,
  IconMapPin,
  IconSearch,
  IconSettings,
} from "@tabler/icons-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

interface HeaderProps {
  initialUnreadNotificationCount: number;
}

export function Header({ initialUnreadNotificationCount }: HeaderProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const locationRef = useRef<HTMLDivElement>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [locationDraft, setLocationDraft] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handlePlaceSelect = (placeName: string) => {
    setLocationDraft(placeName);
    locationMutation.mutate(placeName);
  };

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    router.push(q ? `/search?q=${encodeURIComponent(q)}` : "/search");
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-[#0d0d0d] px-4 py-3">
      <div className="flex items-center gap-3">
        <Link href="/" className="flex min-w-0 items-center">
          <div
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#C9F31D]"
            aria-hidden
          >
            <IconBolt className="h-[18px] w-[18px] text-black" stroke={2.5} />
          </div>
        </Link>

        <form
          onSubmit={handleSearchSubmit}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-[20px] border border-[#2a2a2a] bg-[#161616] px-3.5 py-1.5"
        >
          <IconSearch
            className="h-[18px] w-[18px] flex-shrink-0 text-[#555555]"
            stroke={1.75}
            aria-hidden
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="min-w-0 flex-1 border-none bg-transparent text-sm text-[#f0f0f0] outline-none placeholder:text-[#555555] focus:ring-0"
            aria-label="Search"
          />
        </form>

        <div className="flex items-center justify-end gap-0.5">
          <div ref={locationRef} className="relative">
            <button
              type="button"
              onClick={() => setLocationOpen((open) => !open)}
              className="rounded-lg p-2 transition-colors hover:bg-[#1f1f1f]"
              aria-expanded={locationOpen}
              aria-haspopup="dialog"
              aria-label="Update your area"
            >
              <IconMapPin className="h-5 w-5 text-[#888888]" stroke={1.75} />
            </button>

            {locationOpen && (
              <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#333] bg-[#161616] p-3 shadow-lg">
                <p className="mb-2 text-xs font-medium text-gray-500">
                  Update your area
                </p>
                <MapboxLocationAutocomplete
                  id="header-location"
                  value={locationDraft}
                  onChange={setLocationDraft}
                  onPlaceSelect={handlePlaceSelect}
                  placeholder="Search city or area..."
                  inputClassName="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-3 py-2.5 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none"
                />
                {locationMutation.isPending && (
                  <p className="mt-2 text-xs text-gray-500">Saving…</p>
                )}
              </div>
            )}
          </div>

          <Link
            href="/notifications"
            className="relative rounded-lg p-2 transition-colors hover:bg-[#1f1f1f]"
            aria-label={
              data.unreadCount > 0
                ? `Notifications, ${data.unreadCount} unread`
                : "Notifications"
            }
          >
            <IconBell className="h-5 w-5 text-[#888888]" stroke={1.75} />
            {data.unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#C9F31D] px-1 text-[10px] font-bold text-black">
                {data.unreadCount > 9 ? "9+" : data.unreadCount}
              </span>
            )}
          </Link>

          <Link
            href="/settings"
            className="rounded-lg p-2 transition-colors hover:bg-[#1f1f1f]"
            aria-label="Settings"
          >
            <IconSettings className="h-5 w-5 text-[#888888]" stroke={1.75} />
          </Link>
        </div>
      </div>
    </header>
  );
}
