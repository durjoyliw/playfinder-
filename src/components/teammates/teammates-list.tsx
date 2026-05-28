"use client";

import { getInitials } from "@/lib/settings";
import { formatTeammateSportLabels, type TeammateUser } from "@/lib/teammate";
import kyInstance from "@/lib/ky";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TeammatesListProps {
  initialTeammates: TeammateUser[];
  canRemove?: boolean;
}

export function TeammatesList({
  initialTeammates,
  canRemove = true,
}: TeammatesListProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [teammates, setTeammates] = useState(initialTeammates);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const removeMutation = useMutation({
    mutationFn: (userId: string) =>
      kyInstance.delete(`/api/users/${userId}/followers`),
    onSuccess: (_data, userId) => {
      setTeammates((prev) => prev.filter((t) => t.id !== userId));
      setConfirmingId(null);
      router.refresh();
      queryClient.invalidateQueries({ queryKey: ["follower-info"] });
    },
  });

  if (!teammates.length) {
    return (
      <p className="px-4 py-12 text-center text-sm text-[#888888]">
        No teammates yet. Follow players back when they follow you.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[#1a1a1a]">
      {teammates.map((teammate) => {
        const sportTags = formatTeammateSportLabels(teammate.sports);
        const initials = getInitials(teammate.displayName);
        const hasPhoto = !!teammate.avatarUrl;
        const isConfirming = confirmingId === teammate.id;

        return (
          <li key={teammate.id} className="bg-[#161616]">
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => router.push(`/users/${teammate.username}`)}
                className="flex min-w-0 flex-1 items-center gap-3 text-left"
              >
                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#2a2a2a] text-sm font-bold text-[#888888]">
                  {hasPhoto ? (
                    <img
                      src={teammate.avatarUrl!}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    initials
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[15px] text-[#f0f0f0]">
                    {teammate.displayName}
                  </p>
                  {sportTags && (
                    <p className="mt-0.5 truncate text-xs text-[#555555]">
                      {sportTags}
                    </p>
                  )}
                </div>
              </button>
              {canRemove && !isConfirming && (
                <button
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmingId(teammate.id);
                  }}
                  className="flex-shrink-0 rounded-[20px] border border-[#2a2a2a] bg-[#161616] px-3.5 py-1.5 text-sm text-[#888888] transition-colors hover:bg-[#1f1f1f]"
                >
                  Remove
                </button>
              )}
            </div>

            {isConfirming && (
              <div className="flex flex-wrap items-center gap-2 px-4 pb-3">
                <span className="text-[13px] text-[#888888]">
                  Remove {teammate.displayName} as teammate?
                </span>
                <button
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => removeMutation.mutate(teammate.id)}
                  className="rounded-[20px] bg-[#ef4444] px-3.5 py-[5px] text-xs font-semibold text-white transition-opacity disabled:opacity-70"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  disabled={removeMutation.isPending}
                  onClick={() => setConfirmingId(null)}
                  className="rounded-[20px] border border-[#2a2a2a] bg-transparent px-3.5 py-[5px] text-xs text-[#888888] transition-colors hover:text-[#f0f0f0]"
                >
                  Cancel
                </button>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
