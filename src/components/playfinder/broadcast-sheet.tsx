"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
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

export function BroadcastSheet({ open, onOpenChange }: BroadcastSheetProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [sport, setSport] = useState<Sport>(Sport.FOOTBALL);
  const [intent, setIntent] = useState<PostIntent>(PostIntent.LOOKING_TO_PLAY);
  const [location, setLocation] = useState("");
  const [timeLabel, setTimeLabel] = useState("");
  const [content, setContent] = useState("");

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
    setTimeLabel("");
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate({ sport, intent, location, timeLabel, content });
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
                  onClick={() => setIntent(option.value)}
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
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none"
              required
            />
          </div>

          <div>
            <label
              htmlFor="broadcast-time"
              className="mb-2 block text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              Time
            </label>
            <input
              id="broadcast-time"
              value={timeLabel}
              onChange={(e) => setTimeLabel(e.target.value)}
              placeholder="e.g. Tonight 7 PM"
              className="w-full rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none"
              required
            />
          </div>

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
              className="w-full resize-none rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#C9F31D] focus:outline-none"
              required
            />
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
