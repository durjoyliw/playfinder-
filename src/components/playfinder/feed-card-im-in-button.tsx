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

  const isOwnPost = user.id === authorId;
  const hasInterest =
    localStatus === "PENDING" ||
    localStatus === "ACCEPTED" ||
    userInterestStatus === "PENDING" ||
    userInterestStatus === "ACCEPTED";

  const mutation = useMutation({
    mutationFn: () =>
      kyInstance.post(`/api/posts/${postId}/interest`).json<{ status: string }>(),
    onSuccess: (data) => {
      setLocalStatus(data.status);
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

  if (hasInterest) {
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
      onClick={() => mutation.mutate()}
      disabled={mutation.isPending}
      className={`${baseClass} bg-[#C9F31D] text-black hover:bg-[#d4f73a] disabled:opacity-70`}
    >
      {mutation.isPending ? "..." : "I'm in 🤙"}
    </button>
  );
}
