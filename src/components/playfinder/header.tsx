"use client";

import { MapboxLocationAutocomplete } from "@/components/mapbox-location-autocomplete";
import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { NotificationCountInfo } from "@/lib/types";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Bell, MapPin, Search, Settings, Zap } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useRef, useState } from "react";

interface HeaderProps {
  initialUnreadNotificationCount: number;
}

export function Header({ initialUnreadNotificationCount }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const urlSearchParams = useSearchParams();
  const queryClient = useQueryClient();
  const locationRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
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
    const q = urlSearchParams.get("q") ?? "";
    setSearchQuery(q);
  }, [urlSearchParams]);

  useEffect(() => {
    if (pathname === "/search") {
      requestAnimationFrame(() => searchInputRef.current?.focus());
    }
  }, [pathname]);

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

  const areaLabel = getDisplayArea(userSettings?.location);
  const cityLabel = areaLabel === "your area" ? "Glasgow" : areaLabel;

  return (
    <header className="sticky top-0 z-50 flex shrink-0 items-center gap-2.5 border-b border-white/[0.04] bg-[rgba(8,9,10,0.92)] px-4 py-3 pt-[calc(12px+env(safe-area-inset-top,0px))] font-grotesk backdrop-blur-[20px]">
      <Link href="/" className="flex min-w-0 items-center">
        <div
          className="grid h-9 w-9 shrink-0 place-items-center rounded-[11px] bg-[#c9f31d] text-[#0a0b0a]"
          aria-hidden
        >
          <Zap className="h-5 w-5" fill="currentColor" />
        </div>
      </Link>

      <div ref={locationRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => setLocationOpen((open) => !open)}
          className="flex items-center gap-1.5 rounded-[10px] border border-[#2a2f2a] bg-[#131614] px-3 py-2 text-[13px] font-semibold text-[#b4bcaf] transition-transform active:scale-95"
          aria-expanded={locationOpen}
          aria-haspopup="dialog"
          aria-label="Update your area"
        >
          <MapPin className="h-3.5 w-3.5" />
          {cityLabel}
        </button>

        {locationOpen && (
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-[#2a2f2a] bg-[#131614] p-3 shadow-lg">
            <p className="mb-2 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
              Update your area
            </p>
            <MapboxLocationAutocomplete
              id="header-location"
              value={locationDraft}
              onChange={setLocationDraft}
              onPlaceSelect={handlePlaceSelect}
              placeholder="Search city or area..."
              inputClassName="w-full rounded-[14px] border border-[#2a2f2a] bg-[#1a1e1b] px-3 py-2.5 text-sm text-[#f2f5ef] placeholder:text-[#5a635a] focus:border-[#c9f31d] focus:outline-none"
            />
            {locationMutation.isPending && (
              <p className="mt-2 text-xs text-[#7e8a7e]">Saving…</p>
            )}
          </div>
        )}
      </div>

      <form
        onSubmit={handleSearchSubmit}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-[14px] border border-[#2a2f2a] bg-[#131614] px-3 py-2"
      >
        <Search
          className="h-[18px] w-[18px] shrink-0 text-[#7e8a7e]"
          aria-hidden
        />
        <input
          ref={searchInputRef}
          type="search"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search"
          className="min-w-0 flex-1 border-none bg-transparent text-sm text-[#f2f5ef] outline-none placeholder:text-[#5a635a] focus:ring-0"
          aria-label="Search"
        />
      </form>

      <Link
        href="/notifications"
        className="relative grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#7e8a7e] transition-all active:scale-90 active:bg-[#131614]"
        aria-label={
          data.unreadCount > 0
            ? `Notifications, ${data.unreadCount} unread`
            : "Notifications"
        }
      >
        <Bell className="h-5 w-5" />
        {data.unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-[#08090a] bg-[#c9f31d] px-1 font-dm-mono text-[9px] font-bold text-[#0a0b0a]">
            {data.unreadCount > 9 ? "9+" : data.unreadCount}
          </span>
        )}
      </Link>

      <Link
        href="/settings"
        className="grid h-10 w-10 shrink-0 place-items-center rounded-xl text-[#7e8a7e] transition-all active:scale-90 active:bg-[#131614]"
        aria-label="Settings"
      >
        <Settings className="h-5 w-5" />
      </Link>
    </header>
  );
}
