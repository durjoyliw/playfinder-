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
import { getDisplayArea } from "@/lib/location";
import { Clock3, MapPin, Minus, Plus, Send, Users, X, Zap } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { ComposerDateTimePicker } from "./composer-datetime-picker";
import { submitBroadcast } from "./actions";

export type ComposerTab = "social" | "arena";

interface ComposerSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab: ComposerTab;
}

const textareaClassName =
  "mb-3.5 w-full min-h-[110px] resize-none rounded-[14px] border border-[#2a2f2a] bg-[#131614] p-4 text-base text-white outline-none placeholder:text-[#888888] focus:border-[#C8FF00]";

const fieldInputClassName =
  "min-h-6 w-full border-0 bg-transparent text-[15px] text-white outline-none placeholder:text-[#888888] [color-scheme:dark]";

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
  "rounded-[10px] border border-[#C8FF00] bg-[#C8FF00] px-3 py-2 text-xs font-bold text-black";
const visibilityInactiveClass =
  "rounded-[10px] border border-[#2a2f2a] bg-[#131614] px-3 py-2 text-xs font-semibold text-[#888888]";

const composerSubmitButtonClassName =
  "ml-auto h-12 min-h-12 shrink-0 rounded-full bg-[#C8FF00] px-[22px] py-3 text-[15px] font-bold text-black hover:bg-[#C8FF00]/90";

const sportChipSelectedClass =
  "flex min-h-9 items-center gap-1 rounded-[10px] border border-[#C8FF00] bg-[#C8FF00] px-3 py-2 text-xs font-semibold text-black transition-colors";
const sportChipIdleClass =
  "flex min-h-9 items-center gap-1 rounded-[10px] border border-[#2a2f2a] bg-[#131614] px-3 py-2 text-xs font-semibold text-[#b4bcaf] transition-colors";

const footerChipClass =
  "flex min-h-9 items-center gap-1.5 rounded-[10px] border border-[#2a2f2a] bg-[#131614] px-3 py-2 text-xs text-[#b4bcaf]";

const mediaBtnClass =
  "grid h-9 w-9 place-items-center rounded-[10px] border border-[#2a2f2a] bg-[#131614] text-[#b4bcaf] hover:border-[#C8FF00] hover:text-[#C8FF00]";

function VisibilityToggle({
  visibility,
  onChange,
}: {
  visibility: "PUBLIC" | "TEAMMATES_ONLY";
  onChange: (v: "PUBLIC" | "TEAMMATES_ONLY") => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={() => onChange("PUBLIC")}
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          visibility === "PUBLIC"
            ? visibilityActiveClass
            : visibilityInactiveClass,
        )}
      >
        <IconWorld className="h-3.5 w-3.5" stroke={1.75} />
        Everyone
      </button>
      <button
        type="button"
        onClick={() => onChange("TEAMMATES_ONLY")}
        className={cn(
          "flex items-center gap-1.5 transition-colors",
          visibility === "TEAMMATES_ONLY"
            ? visibilityActiveClass
            : visibilityInactiveClass,
        )}
      >
        <IconBolt className="h-3.5 w-3.5" stroke={2} />
        Teammates
      </button>
    </div>
  );
}

function FieldRow({
  label,
  icon,
  children,
  className,
}: {
  label?: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-[52px] items-center gap-2.5 rounded-[14px] border border-[#2a2f2a] bg-[#131614] px-4 py-3.5",
        className,
      )}
    >
      {(label || icon) && (
        <span className="flex min-w-[50px] shrink-0 items-center gap-1 text-[13px] font-semibold text-[#7e8a7e]">
          {icon}
          {label}
        </span>
      )}
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function ComposerAvatar({
  url,
  initials,
}: {
  url: string | null | undefined;
  initials: string;
}) {
  return (
    <div className="grid h-9 w-9 shrink-0 place-items-center overflow-hidden rounded-full bg-[#c9f31d] text-xs font-bold text-[#0a0b0a]">
      {url ? (
        <img src={url} alt="" className="h-full w-full object-cover" />
      ) : (
        initials
      )}
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
  const postingAsName = profile?.displayName ?? user.displayName;
  const areaChip = getDisplayArea(profile?.location);

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

  const socialSportChipLabel = selectedSportIds.length
    ? selectedSportIds
        .map((id) => getComposerSportDisplay(id).name)
        .join(", ")
    : "Sport tag";

  if (!mounted || !open) return null;

  const sportChips = userSports.map((entry, index) => {
    const sportKey =
      normalizeProfileSportKey(entry.sport) || `sport-${index}`;
    const { name, emoji } = getComposerSportDisplay(entry.sport);
    const selected =
      activeTab === "social"
        ? selectedSportIds.includes(sportKey)
        : selectedSport === sportKey;

    return (
      <button
        key={`${sportKey}-${index}`}
        type="button"
        onClick={() => {
          if (activeTab === "social") {
            setSelectedSportIds((prev) =>
              selected
                ? prev.filter((id) => id !== sportKey)
                : [...prev, sportKey],
            );
            return;
          }
          setSelectedSport(sportKey);
        }}
        className={cn(selected ? sportChipSelectedClass : sportChipIdleClass)}
      >
        {emoji} {name}
      </button>
    );
  });

  const sportsEmptyState = !userSports.length ? (
    <Link
      href="/settings/sports"
      className="text-sm text-[#C8FF00] hover:underline"
    >
      Add sports in Settings
    </Link>
  ) : null;

  const composerFooter = (
    <div className="flex flex-wrap items-center gap-2">
      <span className={footerChipClass}>
        <MapPin className="h-[13px] w-[13px]" />
        {areaChip}
      </span>
      {activeTab === "social" && (
        <>
          <span className={footerChipClass}>
            <Zap className="h-[13px] w-[13px]" />
            {socialSportChipLabel}
          </span>
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
            className={mediaBtnClass}
            aria-label="Add photo"
          >
            <IconPhoto className="h-4 w-4" stroke={1.75} />
          </button>
          <button
            type="button"
            onClick={handleCameraPick}
            className={mediaBtnClass}
            aria-label="Take photo"
          >
            <IconCamera className="h-4 w-4" stroke={1.75} />
          </button>
          <button
            type="button"
            onClick={handleEmojiPick}
            className={mediaBtnClass}
            aria-label="Add emoji"
          >
            <IconMoodSmile className="h-4 w-4" stroke={1.75} />
          </button>
          <button
            type="button"
            onClick={handleGifPick}
            className={mediaBtnClass}
            aria-label="Add GIF"
          >
            <IconGif className="h-4 w-4" stroke={1.75} />
          </button>
        </>
      )}
      <LoadingButton
        type="submit"
        loading={
          activeTab === "social"
            ? socialMutation.isPending
            : arenaMutation.isPending
        }
        disabled={
          activeTab === "social"
            ? !canSubmitSocial || socialMutation.isPending
            : !arenaValid || arenaMutation.isPending
        }
        className={cn(
          composerSubmitButtonClassName,
          activeTab === "arena" && !arenaValid && "cursor-not-allowed opacity-40",
        )}
      >
        {activeTab === "social" ? "Post" : "Post Arena"}
        <Send className="h-[15px] w-[15px]" />
      </LoadingButton>
    </div>
  );

  return createPortal(
    <div className="fixed inset-0 z-[200] flex items-end justify-center">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-[6px]"
        aria-label="Close composer"
        onClick={() => onOpenChange(false)}
      />

      <div
        className="relative z-10 max-h-[90%] w-full max-w-[480px] overflow-y-auto rounded-t-[24px] border border-[#2a2f2a] border-b-0 bg-[#161616] px-4 pb-[calc(24px+env(safe-area-inset-bottom,0px))] pt-4 text-white shadow-[0_-10px_40px_rgba(0,0,0,0.5)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="composer-sheet-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto mb-4 h-1 w-10 rounded-sm bg-[#353c34]" aria-hidden />

        <div className="mb-[18px] flex items-center justify-between">
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

        <div
          className="mb-[18px] grid grid-cols-2 gap-2"
          role="tablist"
          aria-label="Composer type"
        >
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "social"}
            onClick={() => setActiveTab("social")}
            className={cn(
              "min-h-14 rounded-2xl border p-4 text-left transition-all active:scale-[0.97]",
              activeTab === "social"
                ? "border-[#C8FF00] bg-[rgba(200,255,0,0.05)]"
                : "border-[#2a2f2a] bg-[#131614]",
            )}
          >
            <div
              className={cn(
                "mb-1 text-[15px] font-bold",
                activeTab === "social" ? "text-[#C8FF00]" : "text-white",
              )}
            >
              Social
            </div>
            <div className="text-xs text-[#7e8a7e]">
              Share something with the community
            </div>
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === "arena"}
            onClick={() => setActiveTab("arena")}
            className={cn(
              "min-h-14 rounded-2xl border p-4 text-left transition-all active:scale-[0.97]",
              activeTab === "arena"
                ? "border-[#C8FF00] bg-[rgba(200,255,0,0.05)]"
                : "border-[#2a2f2a] bg-[#131614]",
            )}
          >
            <div
              className={cn(
                "mb-1 text-[15px] font-bold",
                activeTab === "arena" ? "text-[#C8FF00]" : "text-white",
              )}
            >
              Arena
            </div>
            <div className="text-xs text-[#7e8a7e]">
              Find players. Create a game.
            </div>
          </button>
        </div>

        <div className="mb-3.5 flex items-center gap-2.5 text-[13px] text-[#7e8a7e]">
          <ComposerAvatar url={user.avatarUrl} initials={avatarInitials} />
          <span>
            Posting as <b className="text-white">{postingAsName}</b>
          </span>
        </div>

        {activeTab === "social" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!canSubmitSocial) return;
              socialMutation.mutate();
            }}
          >
            <div className="relative">
              <textarea
                ref={socialTextareaRef}
                value={socialContent}
                onChange={(e) => setSocialContent(e.target.value)}
                placeholder="What's happening in your sports world?"
                maxLength={280}
                className={textareaClassName}
                required
              />
              <p className="pointer-events-none absolute bottom-6 right-3 text-xs text-[#888888]">
                {socialContent.length}/280
              </p>
            </div>

            <div className="mb-3.5 flex flex-wrap gap-2">
              {sportChips}
              {sportsEmptyState}
            </div>

            <div className="mb-3.5">
              <VisibilityToggle
                visibility={socialVisibility}
                onChange={setSocialVisibility}
              />
            </div>

            {composerFooter}
          </form>
        ) : (
          <form onSubmit={handleArenaSubmit}>
            <div className="relative">
              <textarea
                id="broadcast-details"
                value={arenaContent}
                onChange={(e) => setArenaContent(e.target.value)}
                placeholder="What are you looking for? Describe the game..."
                maxLength={280}
                className={textareaClassName}
              />
              <p className="pointer-events-none absolute bottom-6 right-3 text-xs text-[#888888]">
                {arenaContent.length}/280
              </p>
            </div>

            <div className="mb-3.5 grid gap-2.5">
              <FieldRow label="Sport">
                <div className="flex flex-wrap gap-1.5">
                  {sportChips}
                  {sportsEmptyState}
                </div>
              </FieldRow>

              <FieldRow label="Intent">
                <div className="flex flex-wrap gap-1.5">
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
                            formatBroadcastTimeLabel(defaultDate.toISOString()),
                          );
                        }
                      }}
                      className={cn(
                        "rounded-[10px] border px-3 py-1.5 text-xs font-semibold transition-colors",
                        selectedIntent === option.value
                          ? option.className
                          : "border-[#2a2f2a] bg-transparent text-[#888888]",
                      )}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              </FieldRow>

              <FieldRow icon={<MapPin className="h-3.5 w-3.5" />}>
                <input
                  id="broadcast-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Location, e.g. Powerleague Townhead"
                  className={fieldInputClassName}
                />
              </FieldRow>

              {!isBanter && (
                <FieldRow
                  icon={<Clock3 className="mt-0.5 h-3.5 w-3.5 shrink-0" />}
                  className="items-start"
                >
                  <ComposerDateTimePicker
                    value={gameAt}
                    onChange={handleGameAtChange}
                  />
                </FieldRow>
              )}

              <FieldRow icon={<Users className="h-3.5 w-3.5" />}>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setSlotsNeeded((n) => Math.max(1, n - 1))}
                    className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#2a2f2a] text-white hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Decrease players"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="min-w-[2rem] text-center text-[15px] font-semibold text-white">
                    {slotsNeeded}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSlotsNeeded((n) => Math.min(10, n + 1))}
                    className="grid h-8 w-8 place-items-center rounded-[10px] border border-[#2a2f2a] text-white hover:border-[#C8FF00] hover:text-[#C8FF00]"
                    aria-label="Increase players"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                  <span className="text-xs text-[#7e8a7e]">players needed</span>
                </div>
              </FieldRow>

              <FieldRow label="Visible">
                <VisibilityToggle
                  visibility={arenaVisibility}
                  onChange={setArenaVisibility}
                />
              </FieldRow>
            </div>

            {composerFooter}
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}
