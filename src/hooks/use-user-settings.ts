"use client";

import kyInstance from "@/lib/ky";
import type { UserSettingsData } from "@/lib/settings";
import { useQuery } from "@tanstack/react-query";

export function useUserSettings() {
  return useQuery({
    queryKey: ["user-settings"],
    queryFn: () =>
      kyInstance.get("/api/users/profile").json<UserSettingsData>(),
  });
}
