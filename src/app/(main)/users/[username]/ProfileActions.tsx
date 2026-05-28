"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import useFollowerInfo from "@/hooks/useFollowerInfo";
import kyInstance from "@/lib/ky";
import { FollowerInfo, UserData } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  IconBan,
  IconBellOff,
  IconBolt,
  IconCopy,
  IconDots,
  IconMessageCircle2,
} from "@tabler/icons-react";
import { QueryKey, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useSession } from "../../SessionProvider";

interface ProfileActionsProps {
  user: UserData;
  followerInfo: FollowerInfo;
}

export default function ProfileActions({
  user,
  followerInfo,
}: ProfileActionsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { user: sessionUser } = useSession();
  const queryClient = useQueryClient();
  const { data } = useFollowerInfo(user.id, followerInfo);
  const queryKey: QueryKey = ["follower-info", user.id];
  const [declinedRequest, setDeclinedRequest] = useState(false);
  const [cancelConfirmActive, setCancelConfirmActive] = useState(false);
  const [removeTeammateConfirmActive, setRemoveTeammateConfirmActive] =
    useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [muteLoading, setMuteLoading] = useState(false);
  const [muted, setMuted] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const cancelConfirmTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const removeTeammateConfirmTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const teammateButtonRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  const isOwnProfile = sessionUser.id === user.id;

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen || isOwnProfile) return;

    let cancelled = false;
    setMuteLoading(true);
    kyInstance
      .get(`/api/users/${user.id}/mute`)
      .json<{ muted: boolean }>()
      .then((res) => {
        if (!cancelled) setMuted(!!res.muted);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (!cancelled) setMuteLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOwnProfile, menuOpen, user.id]);

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

  async function handleCopyProfileLink() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/users/${user.username}`,
      );
      toast({ description: "Link copied" });
    } catch {
      toast({
        variant: "destructive",
        description: "Failed to copy link",
      });
    } finally {
      setMenuOpen(false);
    }
  }

  async function handleToggleMute() {
    if (muteLoading) return;
    setMuteLoading(true);
    try {
      if (!muted) {
        await kyInstance.post(`/api/users/${user.id}/mute`);
        setMuted(true);
        toast({ description: `${user.displayName} muted` });
      } else {
        await kyInstance.delete(`/api/users/${user.id}/mute`);
        setMuted(false);
        toast({ description: `${user.displayName} unmuted` });
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setMuteLoading(false);
      setMenuOpen(false);
    }
  }

  async function handleConfirmBlock() {
    try {
      await kyInstance.post(`/api/users/${user.id}/block`);
      toast({ description: `${user.displayName} blocked` });
      router.push("/");
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    } finally {
      setBlockConfirmOpen(false);
      setMenuOpen(false);
    }
  }

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
    <div className="relative flex w-full gap-2">
      {!isOwnProfile && (
        <div className="absolute right-0 top-[-52px] z-10" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[#2a2a2a] bg-[#161616] text-[#f0f0f0] transition-colors hover:bg-[#1e1e1e]"
            aria-label="Profile menu"
          >
            <IconDots className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div
              className="z-50"
              style={{
                background: "#161616",
                border: "1px solid #2a2a2a",
                borderRadius: 12,
                minWidth: 200,
                position: "absolute",
                top: 40,
                right: 0,
                overflow: "hidden",
              }}
            >
              <button
                type="button"
                onClick={() => void handleCopyProfileLink()}
                className="w-full text-left transition-colors hover:bg-[#1e1e1e]"
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 14,
                  color: "#f0f0f0",
                }}
              >
                <IconCopy className="h-4 w-4" />
                Copy profile link
              </button>

              <button
                type="button"
                onClick={() => void handleToggleMute()}
                disabled={muteLoading}
                className={cn(
                  "w-full text-left transition-colors hover:bg-[#1e1e1e]",
                  muteLoading && "opacity-70",
                )}
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 14,
                  color: "#f0f0f0",
                }}
              >
                <IconBellOff className="h-4 w-4" />
                {muted ? `Unmute ${user.displayName}` : `Mute ${user.displayName}`}
              </button>

              <button
                type="button"
                onClick={() => setBlockConfirmOpen(true)}
                className="w-full text-left transition-colors hover:bg-[#1e1e1e]"
                style={{
                  padding: "12px 16px",
                  display: "flex",
                  gap: 10,
                  alignItems: "center",
                  fontSize: 14,
                  color: "#ef4444",
                }}
              >
                <IconBan className="h-4 w-4" />
                Block {user.displayName}
              </button>
            </div>
          )}
        </div>
      )}

      {blockConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6">
          <div className="w-full max-w-sm rounded-2xl border border-[#2a2a2a] bg-[#161616] p-5">
            <p className="text-lg font-bold text-white">
              Block {user.displayName}?
            </p>
            <p className="mt-2 text-sm text-[#888888]">
              They won&apos;t be able to see your profile or posts.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => void handleConfirmBlock()}
                className="flex-1 rounded-xl px-4 py-2.5 text-sm font-semibold"
                style={{ background: "#ef4444", color: "#fff" }}
              >
                Block
              </button>
              <button
                type="button"
                onClick={() => setBlockConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#2a2a2a] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f0f0f0]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

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
