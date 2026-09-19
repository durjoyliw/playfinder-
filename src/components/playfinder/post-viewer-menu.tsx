"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { FollowerInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Ban, Flag, MoreHorizontal, UserPlus, VolumeX } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface PostViewerMenuProps {
  postId: string;
  authorId: string;
  authorUsername: string;
  authorName: string;
  className?: string;
}

const REPORT_REASONS = [
  "Spam",
  "Harassment or bullying",
  "Inappropriate content",
  "Misinformation",
  "Something else",
];

export function PostViewerMenu({
  postId,
  authorId,
  authorUsername,
  authorName,
  className,
}: PostViewerMenuProps) {
  const { user: sessionUser } = useSession();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [blockConfirmOpen, setBlockConfirmOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isOwnPost = sessionUser.id === authorId;
  const followQueryKey: QueryKey = ["follower-info", authorId];
  const muteQueryKey: QueryKey = ["mute-info", authorId];

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: MouseEvent | TouchEvent) {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
    };
  }, [open]);

  const { data: followInfo } = useQuery({
    queryKey: followQueryKey,
    queryFn: () =>
      kyInstance.get(`/api/users/${authorId}/followers`).json<FollowerInfo>(),
    enabled: open && !isOwnPost,
    staleTime: 30 * 1000,
  });

  const { data: muteInfo } = useQuery({
    queryKey: muteQueryKey,
    queryFn: () =>
      kyInstance.get(`/api/users/${authorId}/mute`).json<{ muted: boolean }>(),
    enabled: open && !isOwnPost,
    staleTime: 30 * 1000,
  });

  const followMutation = useMutation({
    mutationFn: () =>
      followInfo?.isFollowedByUser
        ? kyInstance.delete(`/api/users/${authorId}/followers`)
        : kyInstance.post(`/api/users/${authorId}/followers`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: followQueryKey });
      toast({
        description: followInfo?.isFollowedByUser
          ? `Unfollowed @${authorUsername}`
          : `Teammate request sent to @${authorUsername}`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => setOpen(false),
  });

  const muteMutation = useMutation({
    mutationFn: () =>
      muteInfo?.muted
        ? kyInstance.delete(`/api/users/${authorId}/mute`)
        : kyInstance.post(`/api/users/${authorId}/mute`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: muteQueryKey });
      toast({
        description: muteInfo?.muted
          ? `Unmuted @${authorUsername}`
          : `Muted @${authorUsername}`,
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => setOpen(false),
  });

  const blockMutation = useMutation({
    mutationFn: () => kyInstance.post(`/api/users/${authorId}/block`),
    onSuccess: () => {
      toast({ description: `Blocked @${authorUsername}` });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => {
      setBlockConfirmOpen(false);
      setOpen(false);
    },
  });

  const reportMutation = useMutation({
    mutationFn: (reason: string) =>
      kyInstance.post("/api/reports", {
        json: { targetType: "POST", targetId: postId, reason },
      }),
    onSuccess: () => {
      toast({ description: "Thanks -- we'll take a look." });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
    onSettled: () => {
      setReportOpen(false);
      setOpen(false);
    },
  });

  if (isOwnPost) return null;

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-[13px] font-medium text-[#f2f5ef] transition-colors hover:bg-[#1e211e]";

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[#7e8a7e] transition-transform hover:bg-[#1e211e] hover:text-[#f2f5ef] active:scale-90"
        aria-label="Post options"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <MoreHorizontal className="h-[18px] w-[18px]" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-9 z-50 w-[220px] overflow-hidden rounded-xl border border-[#2a2f2a] bg-[#161816] py-1 shadow-lg"
        >
          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            disabled={followMutation.isPending}
            onClick={() => followMutation.mutate()}
          >
            <UserPlus className="h-4 w-4 shrink-0 text-[#7e8a7e]" />
            {followInfo?.isTeammate
              ? `Teammates with @${authorUsername}`
              : followInfo?.isFollowedByUser
                ? `Requested @${authorUsername}`
                : `Follow @${authorUsername}`}
          </button>

          <button
            type="button"
            role="menuitem"
            className={menuItemClass}
            disabled={muteMutation.isPending}
            onClick={() => muteMutation.mutate()}
          >
            <VolumeX className="h-4 w-4 shrink-0 text-[#7e8a7e]" />
            {muteInfo?.muted
              ? `Unmute @${authorUsername}`
              : `Mute @${authorUsername}`}
          </button>

          <button
            type="button"
            role="menuitem"
            className={cn(menuItemClass, "text-[#ef4444] hover:bg-[#2a1616]")}
            onClick={() => {
              setOpen(false);
              setBlockConfirmOpen(true);
            }}
          >
            <Ban className="h-4 w-4 shrink-0" />
            Block @{authorUsername}
          </button>

          <button
            type="button"
            role="menuitem"
            className={cn(menuItemClass, "text-[#ef4444] hover:bg-[#2a1616]")}
            onClick={() => {
              setOpen(false);
              setReportOpen(true);
            }}
          >
            <Flag className="h-4 w-4 shrink-0" />
            Report post
          </button>
        </div>
      )}

      {blockConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
          onClick={() => setBlockConfirmOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#2a2f2a] bg-[#161816] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[#f2f5ef]">
              Block @{authorUsername}?
            </p>
            <p className="mt-2 text-sm text-[#7e8a7e]">
              They won&apos;t be able to see your profile or posts, and you
              won&apos;t see theirs.
            </p>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => blockMutation.mutate()}
                disabled={blockMutation.isPending}
                className="flex-1 rounded-xl bg-[#ef4444] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Block
              </button>
              <button
                type="button"
                onClick={() => setBlockConfirmOpen(false)}
                className="flex-1 rounded-xl border border-[#2a2f2a] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f2f5ef]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {reportOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-6"
          onClick={() => setReportOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-[#2a2f2a] bg-[#161816] p-5"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-lg font-bold text-[#f2f5ef]">Report post</p>
            <p className="mt-2 text-sm text-[#7e8a7e]">
              Why are you reporting this post by {authorName}?
            </p>
            <div className="mt-4 space-y-1.5">
              {REPORT_REASONS.map((reason) => (
                <button
                  key={reason}
                  type="button"
                  disabled={reportMutation.isPending}
                  onClick={() => reportMutation.mutate(reason)}
                  className="w-full rounded-xl border border-[#2a2f2a] px-3.5 py-2.5 text-left text-sm font-medium text-[#f2f5ef] transition-colors hover:bg-[#1e211e]"
                >
                  {reason}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setReportOpen(false)}
              className="mt-4 w-full rounded-xl border border-[#2a2f2a] bg-transparent px-4 py-2.5 text-sm font-semibold text-[#f2f5ef]"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
