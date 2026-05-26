"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconBolt, IconClock } from "@tabler/icons-react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";

interface FollowButtonProps {
  userId: string;
  initialState: FollowerInfo;
  variant?: "default" | "icon";
  className?: string;
}

export default function FollowButton({
  userId,
  initialState,
  variant = "default",
  className,
}: FollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(userId, initialState);
  const queryKey: QueryKey = ["follower-info", userId];

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      const nextFollowed = !previousState?.isFollowedByUser;

      queryClient.setQueryData<FollowerInfo>(queryKey, () => {
        const isFollowedByThem = previousState?.isFollowedByThem ?? false;
        return {
          followers:
            (previousState?.followers || 0) + (previousState?.isFollowedByUser ? -1 : 1),
          isFollowedByUser: nextFollowed,
          isFollowedByThem,
          isTeammate: nextFollowed && isFollowedByThem,
        };
      });

      return { previousState };
    },
    onError(error, variables, context) {
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

  if (variant === "icon") {
    return (
      <Button
        type="button"
        disabled={isPending}
        className={cn(
          "h-12 w-12 rounded-xl border font-semibold",
          data.isTeammate
            ? "border-[rgba(201,243,29,0.4)] bg-transparent text-[#C9F31D] hover:bg-[rgba(201,243,29,0.08)]"
            : data.isFollowedByUser
              ? "border-[#2a2a2a] bg-[#161616] text-[#888888] hover:bg-[#1f1f1f]"
              : "border-[#C9F31D] bg-[#C9F31D] text-black hover:bg-[#b8e019]",
          className,
        )}
        onClick={() => mutate()}
        aria-label={
          data.isTeammate
            ? "Teammate"
            : data.isFollowedByUser
              ? "Pending teammate request"
              : "Add teammate"
        }
      >
        {data.isTeammate ? (
          <IconBolt className="h-5 w-5" stroke={2} />
        ) : data.isFollowedByUser ? (
          <IconClock className="h-5 w-5" stroke={1.75} />
        ) : (
          <IconBolt className="h-5 w-5" stroke={2} />
        )}
      </Button>
    );
  }

  return (
    <Button
      type="button"
      disabled={isPending}
      className={cn(
        "rounded-xl font-semibold",
        data.isTeammate
          ? "border border-[rgba(201,243,29,0.4)] bg-transparent text-[#C9F31D] hover:bg-[rgba(201,243,29,0.08)]"
          : data.isFollowedByUser
            ? "border border-[#2a2a2a] bg-[#161616] text-[#888888] hover:bg-[#1f1f1f]"
            : "bg-[#C9F31D] text-black hover:bg-[#b8e019]",
        className,
      )}
      onClick={() => mutate()}
    >
      {data.isTeammate ? (
        <span className="inline-flex items-center gap-1">
          Teammate <IconBolt className="h-4 w-4" stroke={2} />
        </span>
      ) : data.isFollowedByUser ? (
        <span className="inline-flex items-center gap-1.5">
          <IconClock className="h-4 w-4" stroke={1.75} />
          Pending
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5">
          <IconBolt className="h-4 w-4" stroke={2} />
          Add Teammate
        </span>
      )}
    </Button>
  );
}
