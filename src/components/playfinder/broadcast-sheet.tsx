"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import {
  formatBroadcastTimeLabel,
  toDatetimeLocalValue,
} from "@/lib/broadcast-time";
import { PLAYFINDER_SPORTS, POST_INTENTS } from "@/lib/playfinder";
import { PostsPage } from "@/lib/types";
import { CreateBroadcastValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { PostIntent, Sport } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { submitBroadcast } from "./actions";

interface BroadcastSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 50,
  background: "rgba(0,0,0,0.8)",
  padding: 16,
};

const panelStyle: CSSProperties = {
  width: "100%",
  maxWidth: 480,
  maxHeight: "90vh",
  overflowY: "auto",
  borderRadius: 16,
  border: "1px solid #262626",
  background: "#0d0d0d",
  color: "#fff",
};

const fieldClassName =
  "w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none [color-scheme:dark]";

export function BroadcastSheet({ open, onOpenChange }: BroadcastSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [sport, setSport] = useState<Sport>(Sport.FOOTBALL);
  const [intent, setIntent] = useState<PostIntent>(PostIntent.LOOKING_TO_PLAY);
  const [location, setLocation] = useState("");
  const [gameAt, setGameAt] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [slotsNeeded, setSlotsNeeded] = useState(2);
  const [content, setContent] = useState("");

  const isBanter = intent === PostIntent.BANTER;
  const isLookingToPlay = intent === PostIntent.LOOKING_TO_PLAY;

  useEffect(() => {
    setMounted(true);
  }, []);

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

  const resetForm = () => {
    setSport(Sport.FOOTBALL);
    setIntent(PostIntent.LOOKING_TO_PLAY);
    setLocation("");
    setGameAt("");
    setTimeLabel("");
    setSlotsNeeded(2);
    setContent("");
  };

  const mutation = useMutation({
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
      resetForm();
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
    const iso = new Date(value).toISOString();
    setTimeLabel(formatBroadcastTimeLabel(iso));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const expiresAtIso = gameAt ? new Date(gameAt).toISOString() : null;

    mutation.mutate({
      sport,
      intent,
      location,
      timeLabel: isBanter ? undefined : timeLabel,
      expiresAt: isBanter ? null : expiresAtIso,
      content,
      slotsNeeded: isLookingToPlay ? slotsNeeded : null,
    });
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="broadcast-title"
      onClick={() => onOpenChange(false)}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#262626] px-4 py-4">
          <h2
            id="broadcast-title"
            className="flex-1 text-center text-lg font-bold text-white"
          >
            New broadcast
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-gray-400 hover:bg-[#1f1f1f] hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-4 py-4 pb-8">
          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Sport
            </label>
            <div className="flex flex-wrap gap-2">
              {PLAYFINDER_SPORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSport(s.enum)}
                  className={cn(
                    "rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                    sport === s.enum
                      ? "bg-[#C9F31D] text-black"
                      : "bg-[#1f1f1f] text-white hover:bg-[#2a2a2a]",
                  )}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Intent
            </label>
            <div className="flex flex-wrap gap-2">
              {POST_INTENTS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setIntent(option.value);
                    if (option.value === PostIntent.BANTER) {
                      setGameAt("");
                      setTimeLabel("");
                    } else if (!gameAt) {
                      const defaultDate = new Date();
                      defaultDate.setHours(defaultDate.getHours() + 2, 0, 0, 0);
                      const local = toDatetimeLocalValue(defaultDate);
                      setGameAt(local);
                      setTimeLabel(
                        formatBroadcastTimeLabel(defaultDate.toISOString()),
                      );
                    }
                  }}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium transition-colors",
                    intent === option.value
                      ? option.className
                      : "border-[#333] bg-[#1f1f1f] text-gray-400 hover:text-white",
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
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
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
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
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
                <p className="mt-1.5 text-xs text-gray-500">{timeLabel}</p>
              )}
            </div>
          )}

          {isLookingToPlay && (
            <div>
              <label
                htmlFor="broadcast-slots"
                className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
              >
                Players needed
              </label>
              <input
                id="broadcast-slots"
                type="number"
                min={1}
                max={10}
                value={slotsNeeded}
                onChange={(e) =>
                  setSlotsNeeded(
                    Math.min(10, Math.max(1, Number(e.target.value) || 1)),
                  )
                }
                className={fieldClassName}
                required
              />
            </div>
          )}

          <div>
            <label
              htmlFor="broadcast-details"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Details
            </label>
            <textarea
              id="broadcast-details"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tell people what you need..."
              rows={4}
              maxLength={280}
              className={cn(fieldClassName, "resize-none")}
              required
            />
            <p className="mt-1 text-right text-xs text-gray-500">
              {content.length}/280
            </p>
          </div>

          <LoadingButton
            type="submit"
            loading={mutation.isPending}
            className="w-full rounded-xl bg-[#C9F31D] py-6 text-base font-bold text-black hover:bg-[#b8e019]"
          >
            Post broadcast
          </LoadingButton>
        </form>
      </div>
    </div>,
    document.body,
  );
}
