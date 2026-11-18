"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import { INTEREST_STATUS } from "@/lib/game-notifications";
import kyInstance from "@/lib/ky";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { HTTPError } from "ky";
import { useState } from "react";

interface FeedCardImInButtonProps {
  postId: string;
  authorId: string;
  isFull?: boolean;
  userInterestStatus?: string | null;
  fullWidth?: boolean;
  /** Small pill for the Arena card's bottom-right corner. */
  compact?: boolean;
}

async function errorMessage(error: unknown, fallback: string) {
  if (error instanceof HTTPError) {
    try {
      const body = (await error.response.json()) as { error?: string };
      if (body?.error) return body.error;
    } catch {
      // not JSON
    }
  }
  return fallback;
}

export function FeedCardImInButton({
  postId,
  authorId,
  isFull = false,
  userInterestStatus = null,
  fullWidth = false,
  compact = false,
}: FeedCardImInButtonProps) {
  const { user } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  // undefined = nothing changed locally yet; null = no request.
  const [localStatus, setLocalStatus] = useState<string | null | undefined>(
    undefined,
  );
  const [confirming, setConfirming] = useState(false);

  const status = localStatus === undefined ? userInterestStatus : localStatus;

  const expressMutation = useMutation({
    mutationFn: () =>
      kyInstance
        .post(`/api/posts/${postId}/interest`)
        .json<{ status: string }>(),
    onSuccess: (data) => {
      setLocalStatus(data.status);
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
    onError: async (error) => {
      toast({
        variant: "destructive",
        description: await errorMessage(error, "Couldn't send your request."),
      });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
  });

  const withdrawMutation = useMutation({
    mutationFn: () =>
      kyInstance
        .delete(`/api/posts/${postId}/interest`)
        .json<{ status: string | null }>(),
    onSuccess: (data) => {
      setLocalStatus(data.status ?? null);
      setConfirming(false);
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
    onError: async (error) => {
      setConfirming(false);
      toast({
        variant: "destructive",
        description: await errorMessage(error, "Something went wrong."),
      });
    },
  });

  if (user.id === authorId) {
    return null;
  }

  const baseClass = compact
    ? "flex h-[30px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-full px-3.5 text-[12.5px] font-semibold transition-colors"
    : fullWidth
    ? "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
    : "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors";

  const mutedStyle = {
    background: "var(--pf-c-fill-1a1a1a)",
    color: "var(--pf-c-ink-888888)",
    cursor: "default",
  } as const;
  const successStyle = {
    background: "var(--pf-status-success-bg)",
    color: "var(--pf-volt-text)",
    cursor: "pointer",
  } as const;

  const isPending = status === INTEREST_STATUS.PENDING;
  const isAccepted = status === INTEREST_STATUS.ACCEPTED;

  if ((isPending || isAccepted) && confirming) {
    return (
      <div className={compact ? "flex gap-1.5" : "flex w-full gap-2"}>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={withdrawMutation.isPending}
          className={`${baseClass} ${compact ? "" : "flex-1"} border border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-1a1a1a)] text-[var(--pf-c-ink-888888)] hover:bg-[var(--pf-c-fill-1f1f1f)]`}
        >
          Keep
        </button>
        <button
          type="button"
          onClick={() => withdrawMutation.mutate()}
          disabled={withdrawMutation.isPending}
          className={`${baseClass} ${compact ? "" : "flex-1"} bg-[#ef4444] text-white hover:bg-[#dc2626]`}
        >
          {withdrawMutation.isPending
            ? "..."
            : isAccepted
              ? "Drop out"
              : compact
                ? "Cancel"
                : "Cancel request"}
        </button>
      </div>
    );
  }

  if (isAccepted) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={baseClass}
        style={successStyle}
        aria-label="You're in this game. Tap to drop out."
      >
        {compact ? "✓ You're in" : <>You&apos;re in ✓</>}
      </button>
    );
  }

  if (isPending) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className={baseClass}
        style={successStyle}
        aria-label="Request sent. Tap to cancel it."
      >
        {compact ? "✓ Requested" : "Request sent ✓"}
      </button>
    );
  }

  if (status === INTEREST_STATUS.DECLINED) {
    return (
      <button type="button" disabled className={baseClass} style={mutedStyle}>
        {compact ? "Declined" : "Not this time"}
      </button>
    );
  }

  if (status === INTEREST_STATUS.REMOVED) {
    return (
      <button type="button" disabled className={baseClass} style={mutedStyle}>
        {compact ? "Removed" : "Removed by host"}
      </button>
    );
  }

  if (isFull) {
    return (
      <button
        type="button"
        disabled
        className={baseClass}
        style={{ ...mutedStyle, cursor: "not-allowed" }}
      >
        {compact ? "Full" : "Game full"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => expressMutation.mutate()}
      disabled={expressMutation.isPending}
      className={`${baseClass} bg-[var(--pf-volt)] text-[var(--pf-on-accent)] hover:bg-[var(--pf-volt-hover)] disabled:opacity-70`}
    >
      {expressMutation.isPending ? "..." : compact ? "I'm in" : "I'm in 🤙"}
    </button>
  );
}
