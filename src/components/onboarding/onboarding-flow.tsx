"use client";

import kyInstance from "@/lib/ky";
import {
  getProfileIntentLabel,
  SKILL_LEVEL_OPTIONS,
} from "@/lib/settings";
import { PLAYFINDER_SPORTS } from "@/lib/sports";
import { ProfileIntent, SkillLevel, Sport } from "@prisma/client";
import { MessageCircle, Users, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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

function ProgressDots({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-center gap-2 px-6 pt-6">
      {Array.from({ length: TOTAL_STEPS }, (_, i) => (
        <div
          key={i}
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: i === step ? 24 : 8,
            backgroundColor: i === step ? VOLT : i < step ? "#3d4a1a" : "#2a2a2a",
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

export function OnboardingFlow({ firstName }: OnboardingFlowProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [step, setStep] = useState(0);
  const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
  const [skillLevels, setSkillLevels] = useState<Partial<Record<Sport, SkillLevel>>>(
    {},
  );
  const [location, setLocation] = useState("");
  const [profileIntent, setProfileIntent] = useState<ProfileIntent>(
    ProfileIntent.LOOKING_TO_PLAY,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSport = (sport: Sport) => {
    setSelectedSports((prev) => {
      if (prev.includes(sport)) {
        const next = prev.filter((s) => s !== sport);
        setSkillLevels((skills) => {
          const updated = { ...skills };
          delete updated[sport];
          return updated;
        });
        return next;
      }
      setSkillLevels((skills) => ({
        ...skills,
        [sport]: skills[sport] ?? SkillLevel.INTERMEDIATE,
      }));
      return [...prev, sport];
    });
  };

  const setSportSkill = (sport: Sport, level: SkillLevel) => {
    setSkillLevels((prev) => ({ ...prev, [sport]: level }));
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
    if (step === 2 && selectedSports.length > 0) {
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
          <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
            <h1 className="text-2xl font-bold text-white">Choose your sports</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Pick every sport you play — you can change these later.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {PLAYFINDER_SPORTS.map((sport) => {
                const isSelected = selectedSports.includes(sport.enum);
                return (
                  <button
                    key={sport.enum}
                    type="button"
                    onClick={() => toggleSport(sport.enum)}
                    className={`rounded-full border px-3 py-2.5 text-sm font-medium transition-colors ${
                      isSelected
                        ? "border-[#C9F31D] bg-[#C9F31D] text-black"
                        : "border-[#2a2a2a] bg-[#161616] text-white hover:border-[#3a3a3a]"
                    }`}
                  >
                    {sport.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-auto pt-8">
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
              {selectedSports.map((sport) => {
                const label =
                  PLAYFINDER_SPORTS.find((s) => s.enum === sport)?.label ?? sport;
                const level = skillLevels[sport];
                return (
                  <div
                    key={sport}
                    className="rounded-xl border border-[#2a2a2a] bg-[#161616] p-4"
                  >
                    <p className="mb-3 text-sm font-semibold text-white">{label}</p>
                    <div className="flex flex-wrap gap-2">
                      {SKILL_LEVEL_OPTIONS.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setSportSkill(sport, option.value)}
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
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Glasgow West End, Paisley"
              className="mt-8 w-full rounded-xl border border-[#2a2a2a] bg-[#161616] px-4 py-3.5 text-base text-white placeholder:text-[#6b6b6b] focus:border-[#C9F31D] focus:outline-none"
            />
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
            <h1 className="text-2xl font-bold text-white">You&apos;re all set!</h1>
            <p className="mt-2 text-sm text-[#a3a3a3]">
              Welcome to PlayFinder Glasgow.
            </p>
            <div className="mt-8 rounded-xl border border-[#2a2a2a] bg-[#161616] p-5">
              <p className="mb-3 text-xs font-medium uppercase tracking-wide text-[#a3a3a3]">
                Your profile
              </p>
              <div className="mb-4 flex flex-wrap gap-2">
                {selectedSports.map((sport) => {
                  const label =
                    PLAYFINDER_SPORTS.find((s) => s.enum === sport)?.label ??
                    sport;
                  return (
                    <span
                      key={sport}
                      className="rounded-full border border-[#C9F31D]/40 bg-[#C9F31D]/15 px-3 py-1 text-xs font-medium text-[#C9F31D]"
                    >
                      {label}
                    </span>
                  );
                })}
              </div>
              <div className="space-y-2 text-sm">
                <p className="text-[#a3a3a3]">
                  <span className="text-white">Location:</span> {location.trim()}
                </p>
                <p className="text-[#a3a3a3]">
                  <span className="text-white">Intent:</span>{" "}
                  {getProfileIntentLabel(profileIntent)}
                </p>
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
    <div className="mx-auto flex min-h-screen w-full max-w-[480px] flex-col">
      <ProgressDots step={step} />
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
