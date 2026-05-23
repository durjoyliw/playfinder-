"use client";

import { useUserSettings } from "@/hooks/use-user-settings";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { useQuery } from "@tanstack/react-query";

export function LiveActivityBar() {
  const { data: userSettings } = useUserSettings();
  const area = getDisplayArea(userSettings?.location);

  const { data } = useQuery({
    queryKey: ["playfinder", "active-count"],
    queryFn: () =>
      kyInstance.get("/api/playfinder/active-count").json<{ count: number }>(),
    refetchInterval: 60 * 1000,
  });

  const count = data?.count ?? 0;
  const playerLabel = count === 1 ? "player" : "players";

  return (
    <div className="mx-3 mb-2 rounded-[10px] bg-[#111111] px-3 py-2">
      <div className="flex items-center gap-2 text-sm">
        <span
          className="h-2 w-2 flex-shrink-0 rounded-full bg-[#C9F31D]"
          aria-hidden
        />
        <span className="text-[#888888]">
          <span className="font-bold text-[#C9F31D]">
            {count} {playerLabel}
          </span>{" "}
          active in {area} right now
        </span>
      </div>
    </div>
  );
}
