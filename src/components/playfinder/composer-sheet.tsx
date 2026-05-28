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
  "w-full min-h-[140px] resize-none rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] p-3 text-[15px] text-[#f0f0f0] placeholder:text-[#666666] focus:outline-none";

const fieldClassName =
  "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none [color-scheme:dark]";

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
  "rounded-[20px] border border-[#C9F31D] bg-[#C9F31D] px-4 py-2 text-[13px] font-bold text-[#0d0d0d]";
const visibilityInactiveClass =
  "rounded-[20px] border border-[#2a2a2a] bg-transparent px-4 py-2 text-[13px] text-[#888]";

const composerSubmitButtonClassName =
  "w-full rounded-xl bg-[#C9F31D] py-[14px] text-[15px] font-bold text-[#0d0d0d] hover:bg-[#b8e019]";

const composerFooterClassName =
  "mt-auto flex flex-col gap-3 border-t border-[#262626] pt-4";

const composerMediaRowClassName = "flex min-h-11 items-center gap-2";

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
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/80"
        aria-label="Close composer"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 flex w-full max-w-[480px] flex-col rounded-t-[20px] bg-[#161616] text-white"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-center pt-3">
          <div
            className="h-1 w-10 rounded-sm bg-[#333333]"
            aria-hidden
          />
        </div>

        <div className="relative flex items-center border-b border-[#262626] px-4 pb-0 pt-2">
          <div className="flex flex-1" role="tablist" aria-label="Composer type">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "social"}
              onClick={() => setActiveTab("social")}
              className={cn(
                "flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors",
                activeTab === "social"
                  ? "border-[#C9F31D] text-white"
                  : "border-transparent text-[#666666]",
              )}
            >
              SOCIAL
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === "arena"}
              onClick={() => setActiveTab("arena")}
              className={cn(
                "flex-1 border-b-2 py-3 text-center text-sm font-semibold transition-colors",
                activeTab === "arena"
                  ? "border-[#C9F31D] text-[#C9F31D]"
                  : "border-transparent text-[#666666]",
              )}
            >
              ARENA
            </button>
          </div>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute right-3 top-2 rounded-full p-1.5 text-[#888888] hover:bg-[#1f1f1f] hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[85vh] overflow-y-auto px-4 pb-8 pt-4">
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-sm font-bold text-white">
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
                  <p className="absolute bottom-0 right-0 text-xs text-[#666666]">
                    {socialContent.length}/280
                  </p>
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
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
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-[#C9F31D] bg-[#C9F31D] text-[#0d0d0d]"
                            : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                        )}
                      >
                        {emoji} {name}
                      </button>
                    );
                  })}
                  {!userSports.length && (
                    <Link
                      href="/settings/sports"
                      className="text-sm text-[#C9F31D] hover:underline"
                    >
                      Add sports in Settings
                    </Link>
                  )}
                </div>
              </div>

              <div className="mt-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
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
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666] hover:text-white"
                    aria-label="Add photo"
                  >
                    <IconPhoto className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleCameraPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666] hover:text-white"
                    aria-label="Take photo"
                  >
                    <IconCamera className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleEmojiPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666] hover:text-white"
                    aria-label="Add emoji"
                  >
                    <IconMoodSmile className="h-5 w-5" stroke={1.75} />
                  </button>
                  <button
                    type="button"
                    onClick={handleGifPick}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666] hover:text-white"
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
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-sm font-bold text-white">
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
                  <p className="absolute bottom-0 right-0 text-xs text-[#666666]">
                    {arenaContent.length}/280
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
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
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-[#C9F31D] bg-[#C9F31D] text-[#0d0d0d]"
                            : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                        )}
                      >
                        {emoji} {name}
                      </button>
                    );
                  })}
                  {!userSports.length && (
                    <Link
                      href="/settings/sports"
                      className="text-sm text-[#C9F31D] hover:underline"
                    >
                      Add sports in Settings
                    </Link>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
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
                          : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
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
                  className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#666666]"
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
                    className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#666666]"
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
                    <p className="mt-1.5 text-xs text-[#666666]">{timeLabel}</p>
                  )}
                </div>
              )}

              {isLookingToPlay && (
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
                    Players needed
                  </p>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setSlotsNeeded((n) => Math.max(1, n - 1))
                      }
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626]"
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
                      className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626]"
                      aria-label="Increase players"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#666666]">
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
