"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { getDisplayArea } from "@/lib/location";
import { FollowerInfo } from "@/lib/types";
import { getInitials } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { IconBolt, IconMessage } from "@tabler/icons-react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";

export interface SearchPlayerResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  location: string | null;
  intent: {
    label: string;
    dotClassName: string;
  };
  matchingSportKeys: string[];
  sports: { name: string; emoji: string; key: string }[];
}

interface SearchPlayerRowProps {
  player: SearchPlayerResult;
  query: string;
}

const defaultFollowerInfo: FollowerInfo = {
  followers: 0,
  isFollowedByUser: false,
  isFollowedByThem: false,
  isTeammate: false,
};

function SearchTeammateAction({ userId }: { userId: string }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, defaultFollowerInfo);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate: follow, isPending } = useMutation({
    mutationFn: () => kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      const isFollowedByThem = previousState?.isFollowedByThem ?? false;
      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers: (previousState?.followers || 0) + 1,
        isFollowedByUser: true,
        isFollowedByThem,
        isTeammate: isFollowedByThem,
      }));
      return { previousState };
    },
    onError(error, _variables, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  if (data.isTeammate) {
    return (
      <span className="flex-shrink-0 rounded-full border border-[rgba(201,243,29,0.4)] bg-[#1e1e1e] px-3 py-1.5 text-xs font-semibold text-[#C9F31D]">
        Teammates ⚡
      </span>
    );
  }

  if (data.isFollowedByUser && !data.isFollowedByThem) {
    return (
      <span className="flex-shrink-0 rounded-full border border-[#2a2a2a] bg-[#161616] px-3 py-1.5 text-xs font-semibold text-[#888888]">
        Requested
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        follow();
      }}
      className="flex-shrink-0 rounded-full bg-[#C9F31D] px-3 py-1.5 text-xs font-bold text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-50"
    >
      <span className="inline-flex items-center gap-1">
        <IconBolt className="h-3.5 w-3.5" stroke={2} />
        Add Teammate
      </span>
    </button>
  );
}

export function SearchPlayerRow({ player, query }: SearchPlayerRowProps) {
  const { user } = useSession();
  const router = useRouter();
  const isSelf = user.id === player.id;

  const handleMessage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isSelf) return;
    router.push(`/messages?to=${encodeURIComponent(player.id)}`);
  };

  const distanceLabel = player.location
    ? getDisplayArea(player.location)
    : null;

  return (
    <div className="flex items-start gap-3 border-b border-[#111] px-4 py-3">
      <Link href={`/users/${player.username}`} className="flex-shrink-0">
        <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-sm font-bold text-black">
          {player.avatarUrl ? (
            <img
              src={player.avatarUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(player.displayName)
          )}
        </div>
      </Link>

      <div className="min-w-0 flex-1">
        <Link
          href={`/users/${player.username}`}
          className="font-bold text-white hover:underline"
        >
          {player.displayName}
        </Link>
        <p className="text-xs text-[#666666]">@{player.username}</p>

        <div className="mt-0.5 flex flex-wrap items-center gap-1.5 text-xs text-[#666666]">
          <span
            className={cn(
              "h-2 w-2 flex-shrink-0 rounded-full",
              player.intent.dotClassName,
            )}
          />
          <span>{player.intent.label}</span>
          {distanceLabel && (
            <>
              <span>·</span>
              <span>{distanceLabel}</span>
            </>
          )}
        </div>

        {player.sports.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {player.sports.map((sport) => {
              const highlighted =
                player.matchingSportKeys.includes(sport.key) ||
                sport.name.toLowerCase().includes(query.toLowerCase()) ||
                sport.key.toLowerCase().includes(query.toLowerCase());

              return (
                <span
                  key={sport.key}
                  className={cn(
                    "rounded-full px-2 py-0.5 text-[10px] font-medium",
                    highlighted
                      ? "bg-[#1f2d00] text-[#C9F31D]"
                      : "bg-[#1f1f1f] text-[#666666]",
                  )}
                >
                  {sport.emoji} {sport.name}
                </span>
              );
            })}
          </div>
        )}
      </div>

      {!isSelf && (
        <div className="flex flex-shrink-0 items-center gap-2">
          <SearchTeammateAction userId={player.id} />
          <button
            type="button"
            onClick={handleMessage}
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#1e1e1e] text-[#888888] transition-colors hover:text-white"
            aria-label={`Message ${player.displayName}`}
          >
            <IconMessage className="h-4 w-4" stroke={1.75} />
          </button>
        </div>
      )}
    </div>
  );
}
