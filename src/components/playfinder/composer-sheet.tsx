"use client";

import LoadingButton from "@/components/LoadingButton";
import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import {
  formatBroadcastTimeLabel,
  toDatetimeLocalValue,
} from "@/lib/broadcast-time";
import kyInstance from "@/lib/ky";
import { PLAYFINDER_SPORTS, POST_INTENTS } from "@/lib/playfinder";
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
  "w-full min-h-[120px] resize-none bg-transparent text-[15px] text-[#f0f0f0] placeholder:text-[#666666] focus:outline-none";

const fieldClassName =
  "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none [color-scheme:dark]";

const ARENA_INTENTS = POST_INTENTS.filter(
  (o) =>
    o.value === PostIntent.LOOKING_TO_PLAY ||
    o.value === PostIntent.RECRUITING,
);

function VisibilityToggle({
  visibility,
  onChange,
  variant = "social",
}: {
  visibility: "PUBLIC" | "TEAMMATES_ONLY";
  onChange: (v: "PUBLIC" | "TEAMMATES_ONLY") => void;
  variant?: "social" | "arena";
}) {
  const activeClass =
    variant === "arena"
      ? "border-[#C9F31D] bg-[#C9F31D] text-black"
      : "border-[rgba(201,243,29,0.5)] bg-[rgba(201,243,29,0.08)] text-[#C9F31D]";

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={() => onChange("PUBLIC")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
          visibility === "PUBLIC"
            ? activeClass
            : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
        )}
      >
        <IconWorld className="h-4 w-4" stroke={1.75} />
        Everyone
      </button>
      <button
        type="button"
        onClick={() => onChange("TEAMMATES_ONLY")}
        className={cn(
          "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
          visibility === "TEAMMATES_ONLY"
            ? activeClass
            : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
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
  const [sport, setSport] = useState<Sport>(Sport.FOOTBALL);
  const [intent, setIntent] = useState<PostIntent>(PostIntent.LOOKING_TO_PLAY);
  const [location, setLocation] = useState("");
  const [gameAt, setGameAt] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [slotsNeeded, setSlotsNeeded] = useState(2);
  const [arenaContent, setArenaContent] = useState("");
  const [arenaVisibility, setArenaVisibility] = useState<
    "PUBLIC" | "TEAMMATES_ONLY"
  >("PUBLIC");

  const isBanter = intent === PostIntent.BANTER;
  const isLookingToPlay = intent === PostIntent.LOOKING_TO_PLAY;

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

  const availableSocialSports = useMemo(() => {
    const allowed = new Set((profile?.sports ?? []).map((s) => String(s.sport)));
    return PLAYFINDER_SPORTS.filter((s) => allowed.has(s.id));
  }, [profile?.sports]);

  const avatarInitials = getInitials(profile?.displayName ?? user.displayName);

  const resetArenaForm = () => {
    setSport(Sport.FOOTBALL);
    setIntent(PostIntent.LOOKING_TO_PLAY);
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

  const handleArenaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    arenaMutation.mutate({
      sport,
      intent,
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
                  {availableSocialSports.map((s) => {
                    const selected = selectedSportIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() =>
                          setSelectedSportIds((prev) =>
                            selected
                              ? prev.filter((id) => id !== s.id)
                              : [...prev, s.id],
                          )
                        }
                        className={cn(
                          "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                          selected
                            ? "border-[#C9F31D] bg-[#C9F31D] text-[#0d0d0d]"
                            : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                        )}
                      >
                        {s.emoji} {s.label}
                      </button>
                    );
                  })}
                  {!availableSocialSports.length && (
                    <span className="text-sm text-[#666666]">
                      Add sports in settings to tag them here.
                    </span>
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
                  variant="social"
                />
              </div>

              <div className="mt-auto flex items-center justify-between gap-3 border-t border-[#262626] pt-4">
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
                <div className="flex items-center gap-2">
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
                <LoadingButton
                  type="submit"
                  loading={socialMutation.isPending}
                  disabled={!canSubmitSocial || socialMutation.isPending}
                  className="rounded-[20px] bg-[#C9F31D] px-5 py-2 text-sm font-bold text-[#0d0d0d] hover:bg-[#b8e019]"
                >
                  Post
                </LoadingButton>
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
                    required
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
                  {PLAYFINDER_SPORTS.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSport(s.enum)}
                      className={cn(
                        "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                        sport === s.enum
                          ? "border-[#C9F31D] bg-[#C9F31D] text-[#0d0d0d]"
                          : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                      )}
                    >
                      {s.emoji} {s.label}
                    </button>
                  ))}
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
                        setIntent(option.value);
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
                        intent === option.value
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
                  required
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
                    required
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
                  variant="arena"
                />
              </div>

              <div className="mt-auto pt-2">
                <LoadingButton
                  type="submit"
                  loading={arenaMutation.isPending}
                  className="w-full rounded-xl bg-[#C9F31D] py-3.5 text-base font-bold text-[#0d0d0d] hover:bg-[#b8e019]"
                >
                  Post broadcast
                </LoadingButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body,
  );
}
