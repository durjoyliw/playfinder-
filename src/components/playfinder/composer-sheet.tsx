"use client";

import LoadingButton from "@/components/LoadingButton";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  formatBroadcastTimeLabel,
  toDatetimeLocalValue,
} from "@/lib/broadcast-time";
import kyInstance from "@/lib/ky";
import {
  getOnboardingSport,
  LEGACY_SPORT_ENUM_TO_KEY,
  normalizeSportKey,
} from "@/lib/onboarding-sports";
import { POST_INTENTS } from "@/lib/playfinder";
import type { UserSettingsData } from "@/lib/settings";
import { getInitials } from "@/lib/settings";
import { PostsPage } from "@/lib/types";
import { CreateBroadcastValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { PostIntent, Sport } from "@prisma/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconBolt,
  IconCamera,
  IconGif,
  IconMoodSmile,
  IconPhoto,
  IconWorld,
} from "@tabler/icons-react";
import { Minus, Plus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { submitBroadcast } from "./actions";

export type ComposerTab = "social" | "arena";

interface ComposerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: ComposerTab;
}

const SHEET_CONTENT_MIN_H = "min-h-[32rem]";

const textareaClassName =
  "w-full min-h-[110px] resize-none rounded-[14px] border border-[#2a2f2a] bg-[#131614] p-4 text-base text-white placeholder:text-[#888888] outline-none focus:border-[#C8FF00]";

const fieldClassName =
  "w-full rounded-[14px] border border-[#2a2f2a] bg-[#131614] px-4 py-3.5 text-[15px] text-white placeholder:text-[#888888] outline-none focus:border-[#C8FF00] [color-scheme:dark]";

const ARENA_INTENTS = POST_INTENTS.filter(
  (o) =>
    o.value === PostIntent.LOOKING_TO_PLAY ||
    o.value === PostIntent.RECRUITING,
);

/** Normalises profile sport keys (kebab, snake, PascalCase, legacy enum) to onboarding id form. */
function normalizeProfileSportKey(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  if (LEGACY_SPORT_ENUM_TO_KEY[trimmed]) {
    return LEGACY_SPORT_ENUM_TO_KEY[trimmed];
  }
  const upper = trimmed.toUpperCase();
  if (LEGACY_SPORT_ENUM_TO_KEY[upper]) {
    return LEGACY_SPORT_ENUM_TO_KEY[upper];
  }

  if (trimmed.includes("_") || trimmed === upper) {
    return trimmed.toLowerCase().replace(/_/g, "-");
  }
  if (trimmed.includes("-")) {
    return trimmed.toLowerCase();
  }
  if (/^[a-z]+$/.test(trimmed)) {
    return trimmed;
  }
  if (/^[A-Z][a-z]+$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  if (/[A-Z]/.test(trimmed)) {
    return trimmed
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .toLowerCase();
  }

  return trimmed.toLowerCase();
}

/** Maps a profile sport string to Prisma Sport enum when possible. */
function profileSportKeyToEnum(raw: string): Sport | undefined {
  const key = normalizeProfileSportKey(raw);
  if (!key) return undefined;

  const enumCandidate = key.replace(/-/g, "_").toUpperCase();
  if (Object.values(Sport).includes(enumCandidate as Sport)) {
    return enumCandidate as Sport;
  }

  return Object.values(Sport).find(
    (value) => normalizeProfileSportKey(value) === key,
  );
}

function capitalizeSportLabel(keyOrRaw: string): string {
  const key = normalizeProfileSportKey(keyOrRaw) || keyOrRaw.trim();
  if (!key) return keyOrRaw.trim() || "Sport";

  return key
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

function defaultSportEmoji(key: string): string {
  const k = key.toLowerCase();
  if (
    k.includes("run") ||
    k.includes("athletic") ||
    k.includes("jog") ||
    k.includes("marathon") ||
    k.includes("triathlon")
  ) {
    return "🏃";
  }
  return "⚽";
}

/** Always returns a label + emoji — never drops a profile sport due to missing catalog mapping. */
function getComposerSportDisplay(raw: string): { name: string; emoji: string } {
  const trimmed = raw.trim();
  if (!trimmed) {
    return { name: "Sport", emoji: "⚽" };
  }

  const normalizedKey =
    normalizeProfileSportKey(trimmed) || normalizeSportKey(trimmed);
  const catalogEntry = normalizedKey
    ? getOnboardingSport(normalizedKey)
    : undefined;

  if (catalogEntry) {
    return { name: catalogEntry.name, emoji: catalogEntry.emoji };
  }

  const labelKey = normalizedKey || trimmed;
  return {
    name: capitalizeSportLabel(labelKey),
    emoji: defaultSportEmoji(labelKey),
  };
}

const visibilityActiveClass =
  "rounded-[12px] border border-[#C8FF00] bg-[#C8FF00] px-4 py-2.5 text-[13px] font-bold text-black";
const visibilityInactiveClass =
  "rounded-[12px] border border-[#2a2f2a] bg-[#131614] px-4 py-2.5 text-[13px] text-[#888888]";

const composerSubmitButtonClassName =
  "h-auto w-full rounded-full bg-[#C8FF00] py-[14px] text-[15px] font-bold text-black hover:bg-[#C8FF00]/90";

const composerFooterClassName =
  "mt-auto flex flex-col gap-3 border-t border-[#2a2f2a] pt-4";

const composerMediaRowClassName = "flex min-h-11 items-center gap-2";

const sportChipSelectedClass =
  "rounded-full border border-[#C8FF00] bg-[#C8FF00] px-3 py-1.5 text-sm font-medium text-black transition-colors";
const sportChipIdleClass =
  "rounded-full border border-[#2a2f2a] bg-[#131614] px-3 py-1.5 text-sm font-medium text-[#888888] transition-colors";

const sectionLabelClass =
  "mb-2 block font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#888888]";

function VisibilityToggle({
  visibility,
  onChange,
}: {
  visibility: "PUBLIC" | "TEAMMATES_ONLY";
  onChange: (v: "PUBLIC" | "TEAMMATES_ONLY") => void;
}) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("PUBLIC")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 transition-colors",
          visibility === "PUBLIC"
            ? visibilityActiveClass
            : visibilityInactiveClass,
        )}
      >
        <IconWorld className="h-4 w-4" stroke={1.75} />
        Everyone
      </button>
      <button
        type="button"
        onClick={() => onChange("TEAMMATES_ONLY")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 transition-colors",
          visibility === "TEAMMATES_ONLY"
            ? visibilityActiveClass
            : visibilityInactiveClass,
        )}
      >
        <IconBolt className="h-4 w-4" stroke={2} />
        Teammates only
      </button>
    </div>
  );
}

export function ComposerSheet({
  open,
  onOpenChange,
  defaultTab,
}: ComposerSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useSession();
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState<ComposerTab>(defaultTab);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const socialTextareaRef = useRef<HTMLTextAreaElement>(null);

  // —— Social state ——
  const [socialContent, setSocialContent] = useState("");
  const [socialVisibility, setSocialVisibility] = useState<
    "PUBLIC" | "TEAMMATES_ONLY"
  >("PUBLIC");
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

  // —— Arena state ——
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selectedIntent, setSelectedIntent] = useState<PostIntent | null>(null);
  const [location, setLocation] = useState("");
  const [gameAt, setGameAt] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [slotsNeeded, setSlotsNeeded] = useState(2);
  const [arenaContent, setArenaContent] = useState("");
  const [arenaVisibility, setArenaVisibility] = useState<
    "PUBLIC" | "TEAMMATES_ONLY"
  >("PUBLIC");

  const isBanter = selectedIntent === PostIntent.BANTER;
  const isLookingToPlay = selectedIntent === PostIntent.LOOKING_TO_PLAY;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) setActiveTab(defaultTab);
  }, [open, defaultTab]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onOpenChange]);

  const { data: profile } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => kyInstance.get("/api/users/profile").json<UserSettingsData>(),
    enabled: open,
    staleTime: 60_000,
  });

  const userSports = useMemo(() => profile?.sports ?? [], [profile?.sports]);

  const avatarInitials = getInitials(profile?.displayName ?? user.displayName);

  const resetArenaForm = () => {
    setSelectedSport(null);
    setSelectedIntent(null);
    setLocation("");
    setGameAt("");
    setTimeLabel("");
    setSlotsNeeded(2);
    setArenaContent("");
    setArenaVisibility("PUBLIC");
  };

  const socialMutation = useMutation({
    mutationFn: async () => {
      await kyInstance.post("/api/posts", {
        json: {
          content: socialContent,
          type: "SOCIAL",
          sportTags: selectedSportIds,
          visibility: socialVisibility,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["post-feed", "playfinder"],
      });
      toast({ description: "Posted" });
      setSocialContent("");
      setSelectedSportIds([]);
      setSocialVisibility("PUBLIC");
      onOpenChange(false);
    },
    onError: (error) => {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post. Please try again.",
      });
    },
  });

  const arenaMutation = useMutation({
    mutationFn: (values: CreateBroadcastValues) => submitBroadcast(values),
    onSuccess: async (newPost) => {
      await queryClient.cancelQueries({ queryKey: ["post-feed", "playfinder"] });
      queryClient.setQueriesData<PostsPage>(
        { queryKey: ["post-feed", "playfinder"] },
        (oldData) =>
          oldData
            ? {
                posts: [newPost, ...oldData.posts],
                nextCursor: oldData.nextCursor,
              }
            : { posts: [newPost], nextCursor: null },
      );
      queryClient.invalidateQueries({ queryKey: ["post-feed", "playfinder"] });
      toast({ description: "Broadcast posted" });
      resetArenaForm();
      onOpenChange(false);
    },
    onError(error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to post broadcast. Please try again.",
      });
    },
  });

  const handleGameAtChange = (value: string) => {
    setGameAt(value);
    if (!value) {
      setTimeLabel("");
      return;
    }
    setTimeLabel(formatBroadcastTimeLabel(new Date(value).toISOString()));
  };

  const arenaValid =
    arenaContent.trim().length > 0 &&
    selectedSport !== null &&
    selectedIntent !== null;

  const handleArenaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!arenaValid || !selectedSport || !selectedIntent) return;

    const enumSport = profileSportKeyToEnum(selectedSport);
    if (!enumSport) {
      toast({
        variant: "destructive",
        description: "Could not map the selected sport. Try updating your sports in Settings.",
      });
      return;
    }
    arenaMutation.mutate({
      sport: enumSport,
      intent: selectedIntent,
      location,
      timeLabel: isBanter ? undefined : timeLabel,
      content: arenaContent,
      slotsNeeded: isLookingToPlay ? slotsNeeded : null,
      visibility: arenaVisibility,
    });
  };

  const canSubmitSocial =
    socialContent.trim().length > 0 && socialContent.trim().length <= 280;

  const handlePhotoPick = () => photoInputRef.current?.click();
  const handleCameraPick = () => cameraInputRef.current?.click();
  const handleEmojiPick = () => socialTextareaRef.current?.focus();
  const handleGifPick = () => photoInputRef.current?.click();

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
        aria-label="Close composer"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 flex w-full max-w-[480px] flex-col rounded-t-2xl border border-[#2a2f2a] border-b-0 bg-[#161616] text-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-4">
          <div className="h-1 w-10 rounded-sm bg-[#353c34]" aria-hidden />
        </div>

        <div className="relative mb-4 flex items-center justify-between px-4 pt-4">
          <h2
            id="composer-sheet-title"
            className="text-[22px] font-bold tracking-[-0.03em] text-white"
          >
            Create
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="grid h-[38px] w-[38px] place-items-center rounded-full bg-[#131614] text-[#b4bcaf] transition-transform active:scale-90"
            aria-label="Close"
          >
            <X className="h-[18px] w-[18px]" />
          </button>
        </div>

        <div className="flex px-4" role="tablist" aria-label="Composer type">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "social"}
            onClick={() => setActiveTab("social")}
            className={cn(
              "flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors",
              activeTab === "social"
                ? "border-[#C8FF00] text-white"
                : "border-transparent text-[#888888]",
            )}
          >
            Social
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "arena"}
            onClick={() => setActiveTab("arena")}
            className={cn(
              "flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors",
              activeTab === "arena"
                ? "border-[#C8FF00] text-white"
                : "border-transparent text-[#888888]",
            )}
          >
            Arena
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-4">
          {activeTab === "social" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!canSubmitSocial) return;
                socialMutation.mutate();
              }}
              className={cn("flex flex-col", SHEET_CONTENT_MIN_H)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c9f31d] text-xs font-bold text-black">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div className="relative min-w-0 flex-1">
                  <textarea
                    ref={socialTextareaRef}
                    value={socialContent}
                    onChange={(e) => setSocialContent(e.target.value)}
                    placeholder="What's on your mind..."
                    maxLength={280}
                    className={textareaClassName}
                    required
                  />
                  <p className="absolute bottom-0 right-0 text-xs text-[#888888]">
                    {socialContent.length}/280
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className={sectionLabelClass}>
                  Tag a sport (optional)
                </p>
                <div className="flex flex-wrap gap-2">
                  {userSports.map((entry, index) => {
                    const sportKey =
                      normalizeProfileSportKey(entry.sport) ||
                      `sport-${index}`;
                    const { name, emoji } = getComposerSportDisplay(
                      entry.sport,
                    );
                    const selected = selectedSportIds.includes(sportKey);
                    return (
                      <button
                        key={`${sportKey}-${index}`}
                        type="button"
                        onClick={() =>
                          setSelectedSportIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== sportKey)
                              : [...prev, sportKey],
                          )
                        }
                        className={cn(
                          selected ? sportChipSelectedClass : sportChipIdleClass,
                        )}
                      >
                        {emoji} {name}
                      </button>
                    );
                  })}
                  {!userSports.length && (
                    <Link
                      href="/settings/sports"
                      className="text-sm text-[#C8FF00] hover:underline"
                    >
                      Add sports in Settings
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className={sectionLabelClass}>
                  Visibility
                </p>
                <VisibilityToggle
                  visibility={socialVisibility}
                  onChange={setSocialVisibility}
                />
              </div>

              <div className={composerFooterClassName}>
                <LoadingButton
                  type="submit"
                  loading={socialMutation.isPending}
                  disabled={!canSubmitSocial || socialMutation.isPending}
                  className={composerSubmitButtonClassName}
                >
                  Post
                </LoadingButton>
                <div className={composerMediaRowClassName}>
                  <input
                    ref={photoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={() => {}}
                  />
                  <input
                    ref={cameraInputRef}
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={() => {}}
                  />
                  <button
                    type="button"
                    onClick={handlePhotoPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2f2a] bg-[#131614] text-[#888888] hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Add photo"
                  >
                    <IconPhoto className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2f2a] bg-[#131614] text-[#888888] hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Take photo"
                  >
                    <IconCamera className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleEmojiPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2f2a] bg-[#131614] text-[#888888] hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Add emoji"
                  >
                    <IconMoodSmile className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleGifPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2a2f2a] bg-[#131614] text-[#888888] hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Add GIF"
                  >
                    <IconGif className="h-5 w-5" stroke={1.75} />
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form
              onSubmit={handleArenaSubmit}
              className={cn("flex flex-col space-y-4", SHEET_CONTENT_MIN_H)}
            >
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c9f31d] text-xs font-bold text-black">
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    avatarInitials
                  )}
                </div>
                <div className="relative min-w-0 flex-1">
                  <textarea
                    id="broadcast-details"
                    value={arenaContent}
                    onChange={(e) => setArenaContent(e.target.value)}
                    placeholder="Tell people what you need..."
                    maxLength={280}
                    className={textareaClassName}
                  />
                  <p className="absolute bottom-0 right-0 text-xs text-[#888888]">
                    {arenaContent.length}/280
                  </p>
                </div>
              </div>

              <div>
                <p className={sectionLabelClass}>
                  Sport
                </p>
                <div className="flex flex-wrap gap-2">
                  {userSports.map((entry, index) => {
                    const sportKey =
                      normalizeProfileSportKey(entry.sport) ||
                      `sport-${index}`;
                    const { name, emoji } = getComposerSportDisplay(
                      entry.sport,
                    );
                    const selected = selectedSport === sportKey;
                    return (
                      <button
                        key={`${sportKey}-${index}`}
                        type="button"
                        onClick={() => setSelectedSport(sportKey)}
                        className={cn(
                          selected ? sportChipSelectedClass : sportChipIdleClass,
                        )}
                      >
                        {emoji} {name}
                      </button>
                    );
                  })}
                  {!userSports.length && (
                    <Link
                      href="/settings/sports"
                      className="text-sm text-[#C8FF00] hover:underline"
                    >
                      Add sports in Settings
                    </Link>
                  )}
                </div>
              </div>

              <div>
                <p className={sectionLabelClass}>
                  Intent
                </p>
                <div className="flex flex-wrap gap-2">
                  {ARENA_INTENTS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        setSelectedIntent(option.value);
                        if (!gameAt) {
                          const defaultDate = new Date();
                          defaultDate.setHours(
                            defaultDate.getHours() + 2,
                            0,
                            0,
                            0,
                          );
                          const local = toDatetimeLocalValue(defaultDate);
                          setGameAt(local);
                          setTimeLabel(
                            formatBroadcastTimeLabel(
                              defaultDate.toISOString(),
                            ),
                          );
                        }
                      }}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        selectedIntent === option.value
                          ? option.className
                          : "border-[#2a2f2a] bg-[#131614] text-[#888888]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label
                  htmlFor="broadcast-location"
                  className={sectionLabelClass}
                >
                  Location
                </label>
                <input
                  id="broadcast-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Glasgow Green, Powerleague Paisley"
                  className={fieldClassName}
                />
              </div>

              {!isBanter && (
                <div>
                  <label
                    htmlFor="broadcast-time"
                    className={sectionLabelClass}
                  >
                    Date & time
                  </label>
                  <input
                    id="broadcast-time"
                    type="datetime-local"
                    value={gameAt}
                    onChange={(e) => handleGameAtChange(e.target.value)}
                    className={fieldClassName}
                  />
                  {timeLabel && (
                    <p className="mt-1.5 text-xs text-[#888888]">{timeLabel}</p>
                  )}
                </div>
              )}

              {isLookingToPlay && (
                <div>
                  <p className={sectionLabelClass}>
                    Players needed
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSlotsNeeded((n) => Math.max(1, n - 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#2a2f2a] bg-[#131614] text-white hover:border-[#C8FF00] hover:text-[#C8FF00]"
                      aria-label="Decrease players"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[2rem] text-center text-lg font-semibold text-white">
                      {slotsNeeded}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setSlotsNeeded((n) => Math.min(10, n + 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-[14px] border border-[#2a2f2a] bg-[#131614] text-white hover:border-[#C8FF00] hover:text-[#C8FF00]"
                      aria-label="Increase players"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className={sectionLabelClass}>
                  Visibility
                </p>
                <VisibilityToggle
                  visibility={arenaVisibility}
                  onChange={setArenaVisibility}
                />
              </div>

              <div className={composerFooterClassName}>
                <LoadingButton
                  type="submit"
                  loading={arenaMutation.isPending}
                  disabled={!arenaValid || arenaMutation.isPending}
                  className={cn(
                    composerSubmitButtonClassName,
                    !arenaValid && "cursor-not-allowed opacity-40",
                  )}
                >
                  Post broadcast
                </LoadingButton>
                <div className={composerMediaRowClassName} aria-hidden />
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
