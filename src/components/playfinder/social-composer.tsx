"use client";

import LoadingButton from "@/components/LoadingButton";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import type { UserSettingsData } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  IconBolt,
  IconGif,
  IconMoodSmile,
  IconPhoto,
  IconWorld,
} from "@tabler/icons-react";
import { X } from "lucide-react";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { createPortal } from "react-dom";
import { PLAYFINDER_SPORTS } from "@/lib/playfinder";

interface SocialComposerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToArena: () => void;
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

const textareaClassName =
  "w-full resize-none rounded-xl border border-[#333] bg-[#1a1a1a] px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-[#378ADD] focus:outline-none [color-scheme:dark]";

function initialFromName(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function SocialComposer({
  open,
  onOpenChange,
  onSwitchToArena,
}: SocialComposerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [mounted, setMounted] = useState(false);

  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "TEAMMATES_ONLY">(
    "PUBLIC",
  );
  const [selectedSportIds, setSelectedSportIds] = useState<string[]>([]);

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

  const { data: profile } = useQuery({
    queryKey: ["user-settings"],
    queryFn: () => kyInstance.get("/api/users/profile").json<UserSettingsData>(),
    enabled: open,
    staleTime: 60_000,
  });

  const userSportIds = useMemo(() => {
    const ids = (profile?.sports ?? []).map((s) => s.sport);
    return ids;
  }, [profile?.sports]);

  const availableSports = useMemo(() => {
    const allowed = new Set(userSportIds.map((s) => String(s)));
    return PLAYFINDER_SPORTS.filter((s) => allowed.has(s.id));
  }, [userSportIds]);

  const initials = useMemo(
    () => initialFromName(profile?.displayName ?? "You"),
    [profile?.displayName],
  );

  const mutation = useMutation({
    mutationFn: async () => {
      const sportTags = selectedSportIds;
      await kyInstance.post("/api/posts", {
        json: {
          content,
          type: "SOCIAL",
          sportTags,
          visibility,
        },
      });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["post-feed", "playfinder"] });
      toast({ description: "Posted" });
      setContent("");
      setSelectedSportIds([]);
      setVisibility("PUBLIC");
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

  const canSubmit = content.trim().length > 0 && content.trim().length <= 280;

  if (!mounted || !open) return null;

  return createPortal(
    <div
      style={overlayStyle}
      role="dialog"
      aria-modal="true"
      aria-labelledby="social-title"
      onClick={() => onOpenChange(false)}
    >
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-[#262626] px-4 py-4">
          <h2
            id="social-title"
            className="flex-1 text-center text-lg font-bold text-white"
          >
            New post
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

        {/* Tab switcher */}
        <div className="border-b border-[#262626] px-4 py-3">
          <div className="flex w-full overflow-hidden rounded-xl border border-[#262626] bg-[#0d0d0d]">
            <button
              type="button"
              className="flex-1 bg-[#378ADD] py-2 text-center text-sm font-semibold text-white"
            >
              SOCIAL
            </button>
            <button
              type="button"
              className="flex-1 bg-[#1a1a1a] py-2 text-center text-sm font-semibold text-[#666666]"
              onClick={() => {
                onOpenChange(false);
                onSwitchToArena();
              }}
            >
              ARENA
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSubmit) return;
            mutation.mutate();
          }}
          className="space-y-5 px-4 py-4 pb-6"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-sm font-bold text-white">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What's on your mind..."
                rows={4}
                maxLength={280}
                className={textareaClassName}
                required
              />
              <p className="mt-1 text-right text-xs text-gray-500">
                {content.length}/280
              </p>
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Tag a sport (optional)
            </p>
            <div className="flex flex-wrap gap-2">
              {availableSports.map((s) => {
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
                        ? "border-[#378ADD] bg-[rgba(55,138,221,0.08)] text-[#378ADD]"
                        : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                    )}
                  >
                    {s.emoji} {s.label}
                  </button>
                );
              })}
              {!availableSports.length && (
                <span className="text-sm text-[#666666]">
                  Add sports in settings to tag them here.
                </span>
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-500">
              Visibility
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setVisibility("PUBLIC")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  visibility === "PUBLIC"
                    ? "border-[rgba(201,243,29,0.5)] bg-[rgba(201,243,29,0.08)] text-[#C9F31D]"
                    : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                )}
              >
                <IconWorld className="h-4 w-4" stroke={1.75} />
                Everyone
              </button>
              <button
                type="button"
                onClick={() => setVisibility("TEAMMATES_ONLY")}
                className={cn(
                  "flex flex-1 items-center justify-center gap-1.5 rounded-full border px-3 py-2 text-sm font-medium transition-colors",
                  visibility === "TEAMMATES_ONLY"
                    ? "border-[rgba(201,243,29,0.5)] bg-[rgba(201,243,29,0.08)] text-[#C9F31D]"
                    : "border-[#2a2a2a] bg-[#161616] text-[#666666]",
                )}
              >
                <IconBolt className="h-4 w-4" stroke={2} />
                Teammates only
              </button>
            </div>
          </div>

          <div className="h-px w-full bg-[#262626]" />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666]"
                aria-label="Add photo"
              >
                <IconPhoto className="h-5 w-5" stroke={1.75} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666]"
                aria-label="Add emoji"
              >
                <IconMoodSmile className="h-5 w-5" stroke={1.75} />
              </button>
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1a1a1a] text-[#666666]"
                aria-label="Add GIF"
              >
                <IconGif className="h-5 w-5" stroke={1.75} />
              </button>
            </div>

            <LoadingButton
              type="submit"
              loading={mutation.isPending}
              disabled={!canSubmit || mutation.isPending}
              className="rounded-full bg-[#378ADD] px-[22px] py-2 text-sm font-semibold text-white hover:bg-[#2f78c4]"
            >
              Post
            </LoadingButton>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}

