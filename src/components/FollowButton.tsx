"use client";

import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import { UserPlus } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "./ui/use-toast";
import { cn } from "@/lib/utils";

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

  const { mutate } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser
        ? kyInstance.delete(`/api/users/${userId}/followers`)
        : kyInstance.post(`/api/users/${userId}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers:
          (previousState?.followers || 0) +
          (previousState?.isFollowedByUser ? -1 : 1),
        isFollowedByUser: !previousState?.isFollowedByUser,
      }));

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
  });

  if (variant === "icon") {
    return (
      <Button
        type="button"
        variant="outline"
        size="icon"
        className={cn(
          "h-12 w-12 rounded-xl border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:text-[#C9F31D]",
          data.isFollowedByUser && "text-[#C9F31D]",
          className,
        )}
        onClick={() => mutate()}
        aria-label={data.isFollowedByUser ? "Unfollow user" : "Follow user"}
      >
        <UserPlus className="h-5 w-5" />
      </Button>
    );
  }

  return (
    <Button
      variant={data.isFollowedByUser ? "secondary" : "default"}
      className={className}
      onClick={() => mutate()}
    >
      {data.isFollowedByUser ? "Unfollow" : "Follow"}
    </Button>
  );
}
