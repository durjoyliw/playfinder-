"use client";

import { MapboxLocationAutocomplete } from "@/components/mapbox-location-autocomplete";
import { SportsSearchPicker } from "@/components/onboarding/sports-search-picker";
import kyInstance from "@/lib/ky";
import {
  getOnboardingSport,
  getOnboardingSportEmoji,
  getOnboardingSportLabel,
} from "@/lib/onboarding-sports";
import {
  getProfileIntentLabel,
  PROFILE_INTENT_PROFILE_OPTIONS,
  SKILL_LEVEL_OPTIONS,
} from "@/lib/settings";
import { ProfileIntent, SkillLevel } from "@prisma/client";
import { useQueryClient } from "@tanstack/react-query";
import { MapPin, MessageCircle, Trophy, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const VOLT = "#C9F31D";
const TOTAL_STEPS = 6;

const INTENT_CARDS = [
  {
    value: ProfileIntent.LOOKING_TO_PLAY,
    label: "Looking to Play",
    description: "Find casual games and playing partners",
    borderColor: VOLT,
    bgClass: "bg-[#C9F31D]/10",
    icon: Zap,
    iconClass: "text-[#C9F31D]",
  },
  {
    value: ProfileIntent.JOIN_A_TEAM,
    label: "Join a Team",
    description: "Find a competitive team or club to join",
    borderColor: "#3B82F6",
    bgClass: "bg-[#3B82F6]/10",
    icon: Users,
    iconClass: "text-[#3B82F6]",
  },
  {
    value: ProfileIntent.JUST_VIBES,
    label: "Just Vibes",
    description: "Banter, scores and sports chat",
    borderColor: "#EAB308",
    bgClass: "bg-[#EAB308]/10",
    icon: MessageCircle,
    iconClass: "text-[#EAB308]",
  },
] as const;

interface OnboardingFlowProps {
  firstName: string;
}

function ProgressDots({ step, complete }: { step: number; complete?: boolean }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 pt-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i === step && !complete ? 24 : 8,
            backgroundColor: complete || i <= step ? VOLT : "#2a2a2a",
          }}
        />
      ))}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`w-full rounded-xl bg-[#C9F31D] py-3.5 text-base font-bold text-black transition-colors hover:bg-[#d4f73a] disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
}

function getIntentPillClass(intent: ProfileIntent): string {
  const option = PROFILE_INTENT_PROFILE_OPTIONS.find((o) => o.value === intent);
  return option?.pillClassName ?? "bg-[#C9F31D]/15 text-[#C9F31D]";
}

export function OnboardingFlow({ firstName }: OnboardingFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);
  const [skillLevels, setSkillLevels] = useState<Partial<Record<string, SkillLevel>>>(
    {},
  );
  const [location, setLocation] = useState("");
  const [profileIntent, setProfileIntent] = useState<ProfileIntent>(
    ProfileIntent.LOOKING_TO_PLAY,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const setSportSkill = (sportKey: string, level: SkillLevel) => {
    setSkillLevels((prev) => ({ ...prev, [sportKey]: level }));
  };

  const allSkillsSelected = useMemo(
    () =>
      selectedSports.length > 0 &&
      selectedSports.every((sport) => skillLevels[sport] != null),
    [selectedSports, skillLevels],
  );

  const sportsPayload = useMemo(
    () =>
      selectedSports.map((sport) => ({
        sport,
        skillLevel: skillLevels[sport] as SkillLevel,
      })),
    [selectedSports, skillLevels],
  );

  const goNext = () => {
    setError(null);
    if (step === 1 && selectedSports.length > 0) {
      setSkillLevels((prev) => {
        const next = { ...prev };
        for (const sport of selectedSports) {
          if (!next[sport]) next[sport] = SkillLevel.INTERMEDIATE;
        }
        return next;
      });
    }
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  };

  const handleComplete = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await kyInstance.post("/api/users/onboarding", {
        json: {
          sports: sportsPayload,
          location: location.trim(),
          profileIntent,
        },
      });
      await queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      router.push("/");
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  const content = (() => {
    switch (step) {
      case 0:
        return (
          <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
            <span
              className="mb-10 text-3xl font-bold italic"
              style={{ color: VOLT }}
            >
              PlayFinder
            </span>
            <h1 className="text-3xl font-bold text-white">
              Welcome {firstName}!
            </h1>
            <p className="mt-4 max-w-xs text-base leading-relaxed text-[#a3a3a3]">
              Let&apos;s set up your athlete profile in 60 seconds.
            </p>
            <div className="mt-12 w-full">
              <PrimaryButton onClick={goNext}>Let&apos;s go</PrimaryButton>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex min-h-0 flex-1 flex-col px-6 pb-8 pt-4">
            <h1 className="text-2xl font-bold text-white">Choose your sports</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Search or pick popular sports — you can change these later.
            </p>
            <div className="mt-6 min-h-0 flex-1">
              <SportsSearchPicker
                selected={selectedSports}
                onChange={setSelectedSports}
              />
            </div>
            <div className="mt-6 pt-4">
              <PrimaryButton
                onClick={goNext}
                disabled={selectedSports.length === 0}
              >
                Next
              </PrimaryButton>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
            <h1 className="text-2xl font-bold text-white">Your skill levels</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Select one level for each sport.
            </p>
            <div className="mt-6 space-y-5">
              {selectedSports.map((sportKey) => {
                const sport = getOnboardingSport(sportKey);
                const label = sport?.name ?? sportKey;
                const level = skillLevels[sportKey];
                return (
                  <div
                    key={sportKey}
                    className="rounded-xl border border-[#2a2a2a] bg-[#161616] p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-white">
                      {sport?.emoji} {label}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_LEVEL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSportSkill(sportKey, option.value)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            level === option.value
                              ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                              : "border-[#2a2a2a] bg-[#0d0d0d] text-[#a3a3a3] hover:text-white"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
              <PrimaryButton onClick={goNext} disabled={!allSkillsSelected}>
                Next
              </PrimaryButton>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
            <h1 className="text-2xl font-bold text-white">Where are you based?</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              We use this to show you local games and players.
            </p>
            <div className="mt-8">
              <MapboxLocationAutocomplete
                value={location}
                onChange={setLocation}
                placeholder="e.g. Glasgow West End, Paisley"
              />
            </div>
            <div className="mt-auto pt-8">
              <PrimaryButton onClick={goNext} disabled={!location.trim()}>
                Next
              </PrimaryButton>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
            <h1 className="text-2xl font-bold text-white">
              What are you looking for?
            </h1>
            <div className="mt-6 space-y-3">
              {INTENT_CARDS.map(
                ({
                  value,
                  label,
                  description,
                  borderColor,
                  bgClass,
                  icon: Icon,
                  iconClass,
                }) => {
                  const isSelected = profileIntent === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setProfileIntent(value)}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-colors ${bgClass} ${
                        isSelected ? "" : "border-transparent opacity-80"
                      }`}
                      style={{
                        borderColor: isSelected ? borderColor : "transparent",
                      }}
                    >
                      <Icon className={`mb-3 h-6 w-6 ${iconClass}`} />
                      <p className="text-base font-bold text-white">{label}</p>
                      <p className="mt-1 text-sm text-[#a3a3a3]">{description}</p>
                    </button>
                  );
                },
              )}
            </div>
            <div className="mt-auto pt-8">
              <PrimaryButton onClick={goNext}>Next</PrimaryButton>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
            <div className="flex flex-col items-center text-center">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#C9F31D]">
                <Trophy className="h-8 w-8 text-black" />
              </div>
              <h1 className="text-2xl font-bold text-white">You&apos;re all set!</h1>
              <p className="mt-2 text-sm text-[#a3a3a3]">
                Welcome to PlayFinder Glasgow. Your athlete profile is live.
              </p>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-[#161616] p-4 text-center">
                <p className="text-2xl font-bold text-[#C9F31D]">247</p>
                <p className="mt-1 text-xs text-gray-500">Players near you</p>
              </div>
              <div className="rounded-xl bg-[#161616] p-4 text-center">
                <p className="text-2xl font-bold text-[#C9F31D]">12</p>
                <p className="mt-1 text-xs text-gray-500">Active games today</p>
              </div>
            </div>

            <div className="mt-6 rounded-xl bg-[#161616] p-5">
              <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                Your profile
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSports.map((sportKey) => {
                  const level = skillLevels[sportKey];
                  const levelLabel =
                    SKILL_LEVEL_OPTIONS.find((l) => l.value === level)?.label ??
                    "";
                  return (
                    <span
                      key={sportKey}
                      className="rounded-full bg-[#C9F31D] px-3 py-1.5 text-xs font-medium text-black"
                    >
                      {getOnboardingSportEmoji(sportKey)}{" "}
                      {getOnboardingSportLabel(sportKey)} {levelLabel}
                    </span>
                  );
                })}
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-500">Based in</span>
                  <span className="font-bold text-white">{location.trim()}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Zap className="h-4 w-4 flex-shrink-0 text-gray-500" />
                  <span className="text-gray-500">Looking for</span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${getIntentPillClass(profileIntent)}`}
                  >
                    {getProfileIntentLabel(profileIntent)}
                  </span>
                </div>
              </div>
            </div>

            {error && (
              <p className="mt-4 text-center text-sm text-red-400">{error}</p>
            )}
            <div className="mt-auto pt-8">
              <PrimaryButton
                onClick={handleComplete}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Find my first game →"}
              </PrimaryButton>
            </div>
          </div>
        );

      default:
        return null;
    }
  })();

  return (
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col bg-[#0d0d0d]">
      <ProgressDots step={step} complete={step === TOTAL_STEPS - 1} />
      <div className="flex min-h-0 flex-1 flex-col">{content}</div>
      {step > 0 && step < TOTAL_STEPS - 1 && (
        <div className="px-6 pb-4">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            className="text-sm text-[#a3a3a3] hover:text-white"
          >
            Back
          </button>
        </div>
      )}
    </div>
  );
}
