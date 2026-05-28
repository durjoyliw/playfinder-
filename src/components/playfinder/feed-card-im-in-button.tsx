"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import kyInstance from "@/lib/ky";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

interface FeedCardImInButtonProps {
  postId: string;
  authorId: string;
  isFull?: boolean;
  userInterestStatus?: string | null;
  fullWidth?: boolean;
}

export function FeedCardImInButton({
  postId,
  authorId,
  isFull = false,
  userInterestStatus = null,
  fullWidth = false,
}: FeedCardImInButtonProps) {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [localStatus, setLocalStatus] = useState<string | null>(userInterestStatus);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const status = localStatus ?? userInterestStatus;
  const isPending = status === "PENDING";
  const isAccepted = status === "ACCEPTED";

  const isOwnPost = user.id === authorId;

  const expressMutation = useMutation({
    mutationFn: () =>
      kyInstance.post(`/api/posts/${postId}/interest`).json<{ status: string }>(),
    onSuccess: (data) => {
      setLocalStatus(data.status);
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: () => kyInstance.delete(`/api/posts/${postId}/interest`),
    onSuccess: () => {
      setLocalStatus(null);
      setShowCancelConfirm(false);
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
    },
  });

  if (isOwnPost) {
    return null;
  }

  const baseClass = fullWidth
    ? "flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-colors"
    : "flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-bold transition-colors";

  if (isFull) {
    return (
      <button
        type="button"
        disabled
        className={baseClass}
        style={{
          background: "#1a1a1a",
          color: "#555",
          cursor: "not-allowed",
        }}
      >
        Game Full
      </button>
    );
  }

  if (isPending && showCancelConfirm) {
    return (
      <div
        className={
          fullWidth
            ? "flex w-full gap-2"
            : "flex w-full gap-2"
        }
      >
        <button
          type="button"
          onClick={() => setShowCancelConfirm(false)}
          disabled={cancelMutation.isPending}
          className={`${baseClass} flex-1 border border-[#2a2a2a] bg-[#1a1a1a] text-[#888888] hover:bg-[#1f1f1f]`}
        >
          Keep
        </button>
        <button
          type="button"
          onClick={() => cancelMutation.mutate()}
          disabled={cancelMutation.isPending}
          className={`${baseClass} flex-1 bg-[#ef4444] text-white hover:bg-[#dc2626]`}
        >
          {cancelMutation.isPending ? "..." : "Cancel interest"}
        </button>
      </div>
    );
  }

  if (isPending) {
    return (
      <button
        type="button"
        onClick={() => setShowCancelConfirm(true)}
        className={baseClass}
        style={{
          background: "#1a2a1a",
          color: "#C9F31D",
          cursor: "pointer",
        }}
      >
        Interested ✓
      </button>
    );
  }

  if (isAccepted) {
    return (
      <button
        type="button"
        disabled
        className={baseClass}
        style={{
          background: "#1a2a1a",
          color: "#C9F31D",
          cursor: "default",
        }}
      >
        Interested ✓
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => expressMutation.mutate()}
      disabled={expressMutation.isPending}
      className={`${baseClass} bg-[#C9F31D] text-black hover:bg-[#d4f73a] disabled:opacity-70`}
    >
      {expressMutation.isPending ? "..." : "I'm in 🤙"}
    </button>
  );
}
