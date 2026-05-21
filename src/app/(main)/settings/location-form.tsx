"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
  settingsInputClassName,
  settingsSaveButtonClassName,
  useUserSettings,
} from "./settings-shared";

export function LocationForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!data) return;
    setLocation(data.location ?? "");
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      kyInstance
        .patch("/api/users/profile", {
          json: { location: location.trim() },
        })
        .json<UserSettingsData>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      toast({ description: "Location saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save location. Please try again.",
      });
    },
  });

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  return (
    <SettingsSubpageLayout title="Location">
      <div className="space-y-4 rounded-xl bg-[#161616] p-4">
        <div>
          <label
            htmlFor="location"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Your location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Glasgow"
            className={settingsInputClassName}
          />
        </div>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className={settingsSaveButtonClassName}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </SettingsSubpageLayout>
  );
}
