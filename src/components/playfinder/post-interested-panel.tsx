"use client";

import { formatSportLabel } from "@/lib/playfinder";
import { getInitials } from "@/lib/settings";
import kyInstance from "@/lib/ky";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface InterestUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  sports: { sport: string; skillLevel: string }[];
}

interface PostInterestRow {
  id: string;
  userId: string;
  status: string;
  user: InterestUser;
}

interface PostInterestedPanelProps {
  postId: string;
  authorId: string;
  postType: string | null;
  initialPendingCount?: number;
}

export function PostInterestedPanel({
  postId,
  authorId,
  postType,
  initialPendingCount = 0,
}: PostInterestedPanelProps) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);

  const isArenaPost = postType === "ARENA" || postType === "BROADCAST";

  const { data: interests = [], isLoading } = useQuery({
    queryKey: ["post-interests", postId],
    queryFn: () =>
      kyInstance
        .get(`/api/posts/${postId}/interests`)
        .json<PostInterestRow[]>(),
    enabled: expanded && isArenaPost,
  });

  const patchMutation = useMutation({
    mutationFn: ({
      interestId,
      action,
    }: {
      interestId: string;
      action: "ACCEPT" | "IGNORE" | "REMOVE" | "MANUAL_FILL";
    }) =>
      kyInstance
        .patch(`/api/posts/${postId}/interests/${interestId}`, {
          json: { action },
        })
        .json(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["post-interests", postId] });
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      router.refresh();
    },
  });

  if (!isArenaPost) {
    return null;
  }

  const pendingCount = expanded
    ? interests.filter((i) => i.status === "PENDING").length
    : initialPendingCount;

  const handleManualFill = () => {
    patchMutation.mutate({ interestId: "manual", action: "MANUAL_FILL" });
  };

  return (
    <div className="mb-4">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          style={{
            background: "#161616",
            border: "1px solid #2a2a2a",
            color: "#f0f0f0",
            borderRadius: 20,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          View Interested ({pendingCount})
        </button>
        <button
          type="button"
          onClick={handleManualFill}
          disabled={patchMutation.isPending}
          style={{
            background: "#161616",
            border: "1px solid #2a2a2a",
            color: "#C9F31D",
            borderRadius: 20,
            padding: "8px 16px",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          + Add manually
        </button>
      </div>

      {expanded && (
        <div className="mt-3 space-y-2">
          {isLoading && (
            <p className="text-sm text-[#888888]">Loading…</p>
          )}
          {!isLoading && interests.length === 0 && (
            <p className="text-sm text-[#888888]">No interested players yet.</p>
          )}
          {interests.map((interest) => {
            const sportTag = interest.user.sports[0];
            const sportLabel = sportTag
              ? formatSportLabel(sportTag.sport as never)
              : undefined;

            return (
              <div
                key={interest.id}
                className="flex items-center justify-between gap-3 rounded-xl bg-[#1a1a1a] p-3"
              >
                <Link
                  href={`/users/${interest.user.username}`}
                  className="flex min-w-0 flex-1 items-center gap-3 no-underline"
                >
                  {interest.user.avatarUrl?.startsWith("http") ? (
                    <img
                      src={interest.user.avatarUrl}
                      alt=""
                      className="h-9 w-9 flex-shrink-0 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-xs font-bold text-white">
                      {getInitials(interest.user.displayName)}
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-white">
                      {interest.user.displayName}
                    </p>
                    {sportLabel && (
                      <span className="text-xs text-[#888888]">
                        {sportLabel}
                        {sportTag?.skillLevel
                          ? ` · ${sportTag.skillLevel}`
                          : ""}
                      </span>
                    )}
                  </div>
                </Link>

                <div className="flex flex-shrink-0 items-center gap-2">
                  {interest.status === "ACCEPTED" ? (
                    <>
                      <span className="text-xs font-medium text-[#C9F31D]">
                        Accepted ✓
                      </span>
                      {interest.userId !== authorId && (
                        <button
                          type="button"
                          onClick={() =>
                            patchMutation.mutate({
                              interestId: interest.id,
                              action: "REMOVE",
                            })
                          }
                          className="rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888] hover:text-white"
                        >
                          Remove
                        </button>
                      )}
                    </>
                  ) : interest.status === "PENDING" ? (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          patchMutation.mutate({
                            interestId: interest.id,
                            action: "ACCEPT",
                          })
                        }
                        className="rounded-lg bg-[#C9F31D] px-3 py-1.5 text-xs font-bold text-black"
                      >
                        Accept
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          patchMutation.mutate({
                            interestId: interest.id,
                            action: "IGNORE",
                          })
                        }
                        className="rounded-lg bg-[#2a2a2a] px-3 py-1.5 text-xs text-[#888888]"
                      >
                        Ignore
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
