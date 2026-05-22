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
  });

  const count = data?.count ?? 0;

  if (count === 0) {
    return null;
  }

  const playerLabel = count === 1 ? "player" : "players";

  return (
    <div className="bg-[#0d0d0d] px-4 py-2">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C9F31D] opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C9F31D]" />
        </span>

        <span>
          Active right now in {area} ·{" "}
          <span className="font-medium text-white">
            {count} {playerLabel}
          </span>
        </span>
      </div>
    </div>
  );
}
