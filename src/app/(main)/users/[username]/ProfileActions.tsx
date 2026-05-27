"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo, UserData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { IconBolt, IconMessageCircle2 } from "@tabler/icons-react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

interface ProfileActionsProps {
  user: UserData;
  followerInfo: FollowerInfo;
}

export default function ProfileActions({
  user,
  followerInfo,
}: ProfileActionsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(user.id, followerInfo);
  const queryKey: QueryKey = ["follower-info", user.id];
  const [declinedRequest, setDeclinedRequest] = useState(false);
  const [cancelConfirmActive, setCancelConfirmActive] = useState(false);
  const [removeTeammateConfirmActive, setRemoveTeammateConfirmActive] =
    useState(false);
  const cancelConfirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const removeTeammateConfirmTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const teammateButtonRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return () => {
      if (cancelConfirmTimeoutRef.current) {
        clearTimeout(cancelConfirmTimeoutRef.current);
      }
      if (removeTeammateConfirmTimeoutRef.current) {
        clearTimeout(removeTeammateConfirmTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!removeTeammateConfirmActive) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (
        teammateButtonRef.current &&
        !teammateButtonRef.current.contains(target)
      ) {
        clearRemoveTeammateConfirmTimeout();
        setRemoveTeammateConfirmActive(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [removeTeammateConfirmActive]);

  function clearCancelConfirmTimeout() {
    if (cancelConfirmTimeoutRef.current) {
      clearTimeout(cancelConfirmTimeoutRef.current);
      cancelConfirmTimeoutRef.current = null;
    }
  }

  function clearRemoveTeammateConfirmTimeout() {
    if (removeTeammateConfirmTimeoutRef.current) {
      clearTimeout(removeTeammateConfirmTimeoutRef.current);
      removeTeammateConfirmTimeoutRef.current = null;
    }
  }

  const { mutate: follow, isPending: isFollowing } = useMutation({
    mutationFn: () => kyInstance.post(`/api/users/${user.id}/followers`),
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

  const { mutate: unfollow, isPending: isUnfollowing } = useMutation({
    mutationFn: () => kyInstance.delete(`/api/users/${user.id}/followers`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<FollowerInfo>(queryKey);
      const isFollowedByThem = previousState?.isFollowedByThem ?? false;

      queryClient.setQueryData<FollowerInfo>(queryKey, () => ({
        followers: Math.max(0, (previousState?.followers || 0) - 1),
        isFollowedByUser: false,
        isFollowedByThem,
        isTeammate: false,
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

  const isPending = isFollowing || isUnfollowing;

  function handleRequestedClick() {
    if (cancelConfirmActive) {
      clearCancelConfirmTimeout();
      setCancelConfirmActive(false);
      unfollow();
      return;
    }

    setCancelConfirmActive(true);
    clearCancelConfirmTimeout();
    cancelConfirmTimeoutRef.current = setTimeout(() => {
      setCancelConfirmActive(false);
      cancelConfirmTimeoutRef.current = null;
    }, 2000);
  }

  function handleTeammateClick() {
    if (removeTeammateConfirmActive) {
      clearRemoveTeammateConfirmTimeout();
      setRemoveTeammateConfirmActive(false);
      unfollow();
      return;
    }

    setRemoveTeammateConfirmActive(true);
    clearRemoveTeammateConfirmTimeout();
    removeTeammateConfirmTimeoutRef.current = setTimeout(() => {
      setRemoveTeammateConfirmActive(false);
      removeTeammateConfirmTimeoutRef.current = null;
    }, 3000);
  }

  const showPendingConfirm =
    data.isFollowedByThem && !data.isFollowedByUser && !declinedRequest;

  function renderTeammateAction() {
    if (data.isTeammate) {
      return (
        <div ref={teammateButtonRef} className="flex flex-1">
          <Button
            type="button"
            disabled={isPending}
            className={cn(
              "flex-1 rounded-xl border border-[rgba(201,243,29,0.4)] bg-[#1e1e1e] py-6 font-semibold",
              removeTeammateConfirmActive
                ? "text-[#e05555] hover:bg-[#1e1e1e]"
                : "text-[#C9F31D] hover:bg-[rgba(201,243,29,0.08)]",
            )}
            onClick={handleTeammateClick}
          >
            {removeTeammateConfirmActive ? "Remove teammate?" : "Teammates ⚡"}
          </Button>
        </div>
      );
    }

    if (data.isFollowedByUser && !data.isFollowedByThem) {
      return (
        <Button
          type="button"
          disabled={isPending}
          className={cn(
            "flex-1 rounded-xl border border-[#2a2a2a] bg-[#161616] py-6 font-semibold hover:bg-[#1f1f1f]",
            cancelConfirmActive ? "text-red-400" : "text-[#888888]",
          )}
          onClick={handleRequestedClick}
        >
          {cancelConfirmActive ? "Cancel request?" : "Requested"}
        </Button>
      );
    }

    if (showPendingConfirm) {
      return (
        <div className="flex flex-1 gap-2">
          <Button
            type="button"
            disabled={isPending}
            className="flex-1 rounded-xl bg-[#C9F31D] py-6 font-semibold text-black hover:bg-[#b8e019]"
            onClick={() => follow()}
          >
            Confirm
          </Button>
          <Button
            type="button"
            disabled={isPending}
            className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#1e1e1e] py-6 font-semibold text-[#888888] hover:bg-[#252525]"
            onClick={() => setDeclinedRequest(true)}
          >
            Decline
          </Button>
        </div>
      );
    }

    return (
      <Button
        type="button"
        disabled={isPending}
        className={cn(
          "flex-1 rounded-xl py-6 font-semibold",
          "bg-[#C9F31D] text-black hover:bg-[#b8e019]",
        )}
        onClick={() => follow()}
      >
        <span className="inline-flex items-center gap-1.5">
          <IconBolt className="h-4 w-4" stroke={2} />
          Add Teammate
        </span>
      </Button>
    );
  }

  return (
    <div className="flex w-full gap-2">
      <Button
        className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#161616] py-6 font-semibold text-[#f0f0f0] hover:bg-[#1f1f1f]"
        asChild
      >
        <Link href={`/messages?to=${encodeURIComponent(user.id)}`}>
          <IconMessageCircle2 className="mr-2 h-5 w-5" />
          Message
        </Link>
      </Button>
      {renderTeammateAction()}
    </div>
  );
}
