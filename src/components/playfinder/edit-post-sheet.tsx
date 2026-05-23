"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import {
  formatBroadcastTimeLabel,
  toDatetimeLocalValue,
} from "@/lib/broadcast-time";
import kyInstance from "@/lib/ky";
import { PLAYFINDER_SPORTS, POST_INTENTS } from "@/lib/playfinder";
import { PostData } from "@/lib/types";
import { CreateBroadcastValues } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { PostIntent, Sport } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";

interface EditPostSheetProps {
  post: PostData;
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

function initFromPost(post: PostData) {
  const sport = post.sport ?? Sport.FOOTBALL;
  return {
    sport,
    intent: post.intent,
    location: post.location ?? "",
    gameAt: "",
    timeLabel: post.timeLabel ?? "",
    slotsNeeded: post.slotsNeeded ?? 2,
    content: post.content,
  };
}

export function EditPostSheet({ post, open, onOpenChange }: EditPostSheetProps) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);
  const initial = initFromPost(post);

  const [sport, setSport] = useState<Sport>(initial.sport);
  const [intent, setIntent] = useState<PostIntent>(initial.intent);
  const [location, setLocation] = useState(initial.location);
  const [gameAt, setGameAt] = useState(initial.gameAt);
  const [timeLabel, setTimeLabel] = useState(initial.timeLabel);
  const [slotsNeeded, setSlotsNeeded] = useState(initial.slotsNeeded);
  const [content, setContent] = useState(initial.content);

  const isBanter = intent === PostIntent.BANTER;
  const isLookingToPlay = intent === PostIntent.LOOKING_TO_PLAY;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    const next = initFromPost(post);
    setSport(next.sport);
    setIntent(next.intent);
    setLocation(next.location);
    setGameAt(next.gameAt);
    setTimeLabel(next.timeLabel);
    setSlotsNeeded(next.slotsNeeded);
    setContent(next.content);
  }, [open, post]);

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

  const mutation = useMutation({
    mutationFn: (values: CreateBroadcastValues) =>
      kyInstance.patch(`/api/posts/${post.id}`, { json: values }).json<PostData>(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      router.refresh();
      toast({ description: "Post updated" });
      onOpenChange(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to update post. Please try again.",
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({
      sport,
      intent,
      location,
      timeLabel: isBanter ? undefined : timeLabel,
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
      onClick={() => onOpenChange(false)}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#262626] px-4 py-4">
          <h2 className="flex-1 text-center text-lg font-bold text-white">
            Edit post
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
                    "rounded-full px-3 py-1.5 text-sm font-medium",
                    sport === s.enum
                      ? "bg-[#C9F31D] text-black"
                      : "bg-[#1f1f1f] text-white",
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
                  onClick={() => setIntent(option.value)}
                  className={cn(
                    "rounded-full border px-3 py-1.5 text-sm font-medium",
                    intent === option.value
                      ? option.className
                      : "border-[#333] bg-[#1f1f1f] text-gray-400",
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Location
            </label>
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className={fieldClassName}
              required
            />
          </div>

          {!isBanter && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Date & time
              </label>
              <input
                type="datetime-local"
                value={gameAt}
                onChange={(e) => handleGameAtChange(e.target.value)}
                className={fieldClassName}
                required
              />
            </div>
          )}

          {isLookingToPlay && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
                Players needed
              </label>
              <input
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
            <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500">
              Details
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
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
            Save changes
          </LoadingButton>
        </form>
      </div>
    </div>,
    document.body,
  );
}
