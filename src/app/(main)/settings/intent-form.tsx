"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { PROFILE_INTENT_OPTIONS, type UserSettingsData } from "@/lib/settings";
import { ProfileIntent } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
  settingsSaveButtonClassName,
  useUserSettings,
} from "./settings-shared";

export function IntentForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const [profileIntent, setProfileIntent] = useState<ProfileIntent>(
    ProfileIntent.LOOKING_TO_PLAY,
  );

  useEffect(() => {
    if (!data) return;
    setProfileIntent(data.profileIntent ?? ProfileIntent.LOOKING_TO_PLAY);
  }, [data]);

  const mutation = useMutation({
    mutationFn: () =>
      kyInstance
        .patch("/api/users/profile", {
          json: { profileIntent },
        })
        .json<UserSettingsData>(),
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      toast({ description: "Intent status saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save intent. Please try again.",
      });
    },
  });

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  return (
    <SettingsSubpageLayout title="Intent Status">
      <div className="space-y-4 rounded-xl bg-[#161616] p-4">
        <p className="text-xs text-muted-foreground">
          Let others know what you&apos;re looking for on PlayFinder.
        </p>

        <div className="flex flex-wrap gap-2">
          {PROFILE_INTENT_OPTIONS.map((option) => {
            const isActive = profileIntent === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setProfileIntent(option.value)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  isActive ? option.activeClassName : option.className
                }`}
              >
                {option.label}
              </button>
            );
          })}
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
