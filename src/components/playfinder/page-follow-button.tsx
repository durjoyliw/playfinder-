"use client";

import {
  followPage,
  unfollowPage,
} from "@/app/(main)/pages/actions";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { QueryKey, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PageFollowInfo = {
  followers: number;
  isFollowedByUser: boolean;
};

export function usePageFollowInfo(
  pageId: string,
  initialState: PageFollowInfo,
) {
  return useQuery({
    queryKey: ["page-follow-info", pageId],
    queryFn: async () => initialState,
    initialData: initialState,
    staleTime: Infinity,
  });
}

interface PageFollowButtonProps {
  pageId: string;
  initialState: PageFollowInfo;
  className?: string;
}

export function PageFollowButton({
  pageId,
  initialState,
  className,
}: PageFollowButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["page-follow-info", pageId];
  const { data } = usePageFollowInfo(pageId, initialState);

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data.isFollowedByUser ? unfollowPage(pageId) : followPage(pageId),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });
      const previous = queryClient.getQueryData<PageFollowInfo>(queryKey);
      const nextFollowed = !previous?.isFollowedByUser;
      queryClient.setQueryData<PageFollowInfo>(queryKey, {
        followers: Math.max(
          0,
          (previous?.followers ?? 0) + (previous?.isFollowedByUser ? -1 : 1),
        ),
        isFollowedByUser: nextFollowed,
      });
      return { previous };
    },
    onError(error, _vars, context) {
      queryClient.setQueryData(queryKey, context?.previous);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Something went wrong. Please try again.",
      });
    },
  });

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => mutate()}
      className={cn(
        "flex h-[42px] flex-1 items-center justify-center rounded-xl text-[14px] font-bold tracking-[-0.01em] transition-[filter,opacity] disabled:opacity-70",
        data.isFollowedByUser
          ? "border border-[#2a2f2a] bg-[#131614] text-[#f2f5ef]"
          : "bg-[#a1c217] text-[#0a0b0a] hover:brightness-110",
        className,
      )}
    >
      {data.isFollowedByUser ? "Following" : "Follow"}
    </button>
  );
}
