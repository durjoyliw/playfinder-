"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { MapboxLocationAutocomplete } from "@/components/mapbox-location-autocomplete";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
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
      <div className="space-y-4 rounded-xl bg-[var(--pf-c-fill-161616)] p-4 pf-card">
        <div>
          <label
            htmlFor="location"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Your location
          </label>
          <MapboxLocationAutocomplete
            id="location"
            value={location}
            onChange={setLocation}
            placeholder="e.g. Glasgow"
            inputClassName="w-full rounded-xl border border-[var(--pf-c-line-333333)] bg-[var(--pf-c-fill-1a1a1a)] px-4 py-3 text-base text-[var(--pf-c-ink-ffffff)] lg:text-sm placeholder:text-[var(--pf-c-ink-6b7280)] focus:border-[var(--pf-volt)] focus:outline-none pf-card"
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
