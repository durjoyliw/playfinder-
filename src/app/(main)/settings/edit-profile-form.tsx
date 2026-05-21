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

export function EditProfileForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");

  useEffect(() => {
    if (!data) return;
    setDisplayName(data.displayName);
    setBio(data.bio ?? "");
    setLocation(data.location ?? "");
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      kyInstance
        .patch("/api/users/profile", {
          json: {
            displayName: displayName.trim(),
            bio: bio.trim(),
            location: location.trim(),
          },
        })
        .json<UserSettingsData>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      toast({ description: "Profile saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save profile. Please try again.",
      });
    },
  });

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  return (
    <SettingsSubpageLayout title="Edit Profile">
      <div className="space-y-4 rounded-xl bg-[#161616] p-4">
        <div>
          <label
            htmlFor="displayName"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className={settingsInputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="bio"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Athlete story / bio
          </label>
          <textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className={`${settingsInputClassName} resize-none`}
          />
        </div>

        <div>
          <label
            htmlFor="location"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className={settingsInputClassName}
          />
        </div>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || !displayName.trim()}
          className={settingsSaveButtonClassName}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </SettingsSubpageLayout>
  );
}
