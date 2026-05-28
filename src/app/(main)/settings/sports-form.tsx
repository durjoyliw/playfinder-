"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { getSportDisplay } from "@/lib/onboarding-sports";
import type { UserSettingsData, UserSportEntry } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { SkillLevel } from "@prisma/client";
import { IconCheck, IconSearch, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SettingsError,
  SettingsLoading,
  SettingsSubpageLayout,
  useUserSettings,
} from "./settings-shared";

const EDIT_SPORT_ENUMS = [
  "FOOTBALL",
  "TENNIS",
  "BASKETBALL",
  "GYM",
  "RUNNING",
  "SWIMMING",
  "SQUASH",
  "CYCLING",
  "YOGA",
  "HIKING",
  "BADMINTON",
  "RUGBY",
  "CRICKET",
  "GOLF",
  "BOXING",
  "CLIMBING",
  "VOLLEYBALL",
  "TABLE_TENNIS",
  "MARTIAL_ARTS",
  "SKIING",
  "BASEBALL",
  "KARATE",
  "DANCE",
  "DANCING",
  "FUTSAL",
  "PADEL",
  "PILATES",
  "CROSSFIT",
  "TRAIL_RUNNING",
  "TRIATHLON",
  "OPEN_WATER_SWIMMING",
  "SURFING",
  "KITESURFING",
  "WINDSURFING",
  "ROWING",
  "KAYAKING",
  "CANOEING",
  "SAILING",
  "SNOWBOARDING",
  "ICE_SKATING",
  "ICE_HOCKEY",
  "CURLING",
  "JUDO",
  "TAEKWONDO",
  "MUAY_THAI",
  "BJJ",
  "WRESTLING",
  "FENCING",
  "ARCHERY",
  "SHOOTING",
  "EQUESTRIAN",
  "GYMNASTICS",
  "TRAMPOLINING",
  "PARKOUR",
  "SKATEBOARDING",
  "MOUNTAIN_BIKING",
  "BMX",
  "ORIENTEERING",
  "MOTORSPORT",
  "KARTING",
  "ESPORTS",
  "CHESS",
  "DARTS",
  "SNOOKER",
  "CHEERLEADING",
  "ACROBATICS",
  "MMA",
  "GAELIC_FOOTBALL",
  "AMERICAN_FOOTBALL",
  "AUSTRALIAN_FOOTBALL",
  "RUGBY_LEAGUE",
  "SOFTBALL",
  "FIELD_HOCKEY",
  "LACROSSE",
  "HANDBALL",
  "WATER_POLO",
  "BEACH_VOLLEYBALL",
  "NETBALL",
  "FRISBEE",
  "DODGEBALL",
  "BOWLING",
  "HORSE_RIDING",
  "ATHLETICS",
] as const;

const EDIT_SPORTS = EDIT_SPORT_ENUMS.map((enumKey) => {
  const value = enumKey.toLowerCase().replace(/_/g, "-");
  const { name, emoji } = getSportDisplay(value);
  return { value, label: name, emoji };
});

const EDIT_SKILL_LEVEL_OPTIONS = [
  { value: SkillLevel.BEGINNER, label: "Beginner" },
  { value: SkillLevel.INTERMEDIATE, label: "Intermediate" },
  { value: SkillLevel.ADVANCED, label: "Semi-Pro" },
  { value: SkillLevel.PRO, label: "Pro" },
] as const;

function buildInitialState(sports: UserSportEntry[]) {
  return {
    orderedSportIds: sports.map((entry) => entry.sport),
    skillLevels: Object.fromEntries(
      sports.map((entry) => [entry.sport, entry.skillLevel]),
    ) as Partial<Record<string, SkillLevel>>,
  };
}

function getSportLabel(sportId: string): string {
  return EDIT_SPORTS.find((s) => s.value === sportId)?.label ?? sportId;
}

function filterEditSports(query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return EDIT_SPORTS;
  return EDIT_SPORTS.filter(
    (sport) =>
      sport.label.toLowerCase().includes(q) ||
      sport.value.toLowerCase().includes(q),
  );
}

const levelPillBaseClass =
  "rounded-[20px] border px-[14px] py-1.5 text-[13px] font-medium transition-colors";
const levelPillInactiveClass =
  "border-[#2a2a2a] bg-[#161616] text-[#888] hover:border-[#3a3a3a]";
const levelPillActiveClass =
  "border-[#C9F31D] bg-[#C9F31D] font-bold text-[#0d0d0d]";

export function SportsForm() {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data, status } = useUserSettings();

  const [search, setSearch] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [orderedSportIds, setOrderedSportIds] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<
    Partial<Record<string, SkillLevel | null>>
  >({});
  const searchContainerRef = useRef<HTMLDivElement>(null);

  const filteredSports = useMemo(() => filterEditSports(search), [search]);
  const showDropdown = dropdownOpen && search.trim().length > 0;

  useEffect(() => {
    if (!data) return;
    const initial = buildInitialState(data.sports);
    setOrderedSportIds(initial.orderedSportIds);
    setSkillLevels(initial.skillLevels);
  }, [data]);

  useEffect(() => {
    if (!dropdownOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(target)
      ) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [dropdownOpen]);

  const mutation = useMutation({
    mutationFn: () => {
      const sports = orderedSportIds.map((sport) => ({
        sport,
        skillLevel: skillLevels[sport] ?? null,
      }));

      return kyInstance
        .put("/api/users/profile", { json: { sports } })
        .json<UserSettingsData>();
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(["user-settings"], updated);
      const initial = buildInitialState(updated.sports);
      setOrderedSportIds(initial.orderedSportIds);
      setSkillLevels(initial.skillLevels);
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

  const removeSport = (sport: string) => {
    setOrderedSportIds((prev) => prev.filter((id) => id !== sport));
    setSkillLevels((prev) => {
      const next = { ...prev };
      delete next[sport];
      return next;
    });
  };

  const selectSportFromSearch = (sport: string) => {
    if (!orderedSportIds.includes(sport)) {
      setOrderedSportIds((prev) => [...prev, sport]);
    }
    setSearch("");
    setDropdownOpen(false);
  };

  const setSportSkill = (sport: string, skillLevel: SkillLevel) => {
    setSkillLevels((prev) => {
      if (prev[sport] === skillLevel) {
        return { ...prev, [sport]: null };
      }
      return { ...prev, [sport]: skillLevel };
    });
  };

  if (status === "pending") return <SettingsLoading />;
  if (status === "error" || !data) return <SettingsError />;

  return (
    <SettingsSubpageLayout title="My Sports">
      <div className="rounded-xl bg-[#161616] p-4">
        <div ref={searchContainerRef} className="relative mb-4">
          <IconSearch
            className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-[#666666]"
            stroke={1.75}
          />
          <input
            type="search"
            value={search}
            onChange={(e) => {
              const value = e.target.value;
              setSearch(value);
              setDropdownOpen(value.trim().length > 0);
            }}
            onFocus={() => {
              if (search.trim().length > 0) setDropdownOpen(true);
            }}
            placeholder="Search sports..."
            className="w-full rounded-[20px] border border-[#2a2a2a] bg-[#161616] py-2 pl-10 pr-4 text-[#f0f0f0] placeholder:text-[#666666] focus:border-[#C9F31D] focus:outline-none"
          />

          {showDropdown && (
            <ul className="absolute left-0 right-0 z-20 mt-1 max-h-[220px] overflow-y-auto rounded-xl border border-[#2a2a2a] bg-[#161616]">
              {filteredSports.length === 0 ? (
                <li className="px-[14px] py-2.5 text-sm text-[#666666]">
                  No sports found
                </li>
              ) : (
                filteredSports.map((sport) => {
                  const isSelected = orderedSportIds.includes(sport.value);
                  return (
                    <li key={sport.value}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => selectSportFromSearch(sport.value)}
                        className="flex w-full items-center gap-2.5 px-[14px] py-2.5 text-left text-[14px] text-[#f0f0f0] transition-colors hover:bg-[#1e1e1e]"
                      >
                        <span>{sport.emoji}</span>
                        <span className="min-w-0 flex-1">{sport.label}</span>
                        {isSelected && (
                          <IconCheck
                            className="h-4 w-4 flex-shrink-0 text-[#C9F31D]"
                            stroke={2.5}
                          />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          )}
        </div>

        {orderedSportIds.length > 0 && (
          <div className="mt-5 space-y-4">
            {orderedSportIds.map((sportId) => {
              const skillLevel = skillLevels[sportId];

              return (
                <div key={sportId}>
                  <div className="mb-2 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => removeSport(sportId)}
                      className="text-[13px] text-[#888] transition-colors hover:text-[#f0f0f0]"
                    >
                      {getSportLabel(sportId)}
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSport(sportId)}
                      className="cursor-pointer border-0 bg-transparent p-0 text-[14px] text-[#555] transition-colors hover:text-[#f0f0f0]"
                      aria-label={`Remove ${getSportLabel(sportId)}`}
                    >
                      <IconX size={14} stroke={2} />
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EDIT_SKILL_LEVEL_OPTIONS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setSportSkill(sportId, level.value)}
                        className={cn(
                          levelPillBaseClass,
                          skillLevel === level.value
                            ? levelPillActiveClass
                            : levelPillInactiveClass,
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="button"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
          className="mt-4 w-full rounded-xl bg-[#C9F31D] py-[14px] text-[15px] font-bold text-[#0d0d0d] transition-colors hover:bg-[#b8e019] disabled:opacity-60"
        >
          {mutation.isPending ? "Saving..." : "Save"}
        </button>
      </div>
    </SettingsSubpageLayout>
  );
}
