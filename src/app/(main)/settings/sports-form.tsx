"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import {
  SETTINGS_SPORTS,
  SKILL_LEVEL_OPTIONS,
  type UserSettingsData,
  type UserSportEntry,
} from "@/lib/settings";
import { SkillLevel, Sport } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
  settingsSaveButtonClassName,
  useUserSettings,
} from "./settings-shared";

function buildSportsMap(sports: UserSportEntry[]) {
  return Object.fromEntries(
    sports.map((entry) => [entry.sport, entry.skillLevel]),
  ) as Partial<Record<Sport, SkillLevel>>;
}

export function SportsForm() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const [selectedSports, setSelectedSports] = useState<
    Partial<Record<Sport, SkillLevel>>
  >({});

  useEffect(() => {
    if (!data) return;
    setSelectedSports(buildSportsMap(data.sports));
  }, [data]);

  const mutation = useMutation({
    mutationFn: () => {
      const sports = Object.entries(selectedSports).map(
        ([sport, skillLevel]) => ({
          sport: sport as Sport,
          skillLevel: skillLevel as SkillLevel,
        }),
      );

      return kyInstance
        .put("/api/users/profile", { json: { sports } })
        .json<UserSettingsData>();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      setSelectedSports(buildSportsMap(updated.sports));
      router.refresh();
      toast({ description: "Sports saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save sports. Please try again.",
      });
    },
  });

  const toggleSport = (sport: Sport) => {
    setSelectedSports((prev) => {
      const next = { ...prev };
      if (next[sport]) {
        delete next[sport];
      } else {
        next[sport] = SkillLevel.INTERMEDIATE;
      }
      return next;
    });
  };

  const setSportSkill = (sport: Sport, skillLevel: SkillLevel) => {
    setSelectedSports((prev) => ({ ...prev, [sport]: skillLevel }));
  };

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  return (
    <SettingsSubpageLayout title="My Sports">
      <div className="rounded-xl bg-[#161616] p-4">
        <div className="grid grid-cols-2 gap-3">
          {SETTINGS_SPORTS.map((sport) => {
            const isSelected = !!selectedSports[sport.value];
            const skillLevel = selectedSports[sport.value];

            return (
              <div key={sport.value} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => toggleSport(sport.value)}
                  className={`rounded-full border px-3 py-2 text-sm font-medium transition-colors ${
                    isSelected
                      ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                      : "border-[#2a2a2a] bg-[#0d0d0d] text-white hover:border-[#3a3a3a]"
                  }`}
                >
                  {sport.label}
                </button>

                {isSelected && skillLevel && (
                  <div className="flex flex-wrap gap-1">
                    {SKILL_LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSportSkill(sport.value, level.value)}
                        className={`rounded-md px-2 py-1 text-[10px] font-medium transition-colors ${
                          skillLevel === level.value
                            ? "bg-[#C9F31D] text-black"
                            : "bg-[#0d0d0d] text-muted-foreground hover:text-white"
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className={`${settingsSaveButtonClassName} mt-4`}
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </SettingsSubpageLayout>
  );
}
