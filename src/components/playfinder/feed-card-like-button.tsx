"use client";

import kyInstance from "@/lib/ky";
import { LikeInfo } from "@/lib/types";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";

interface FeedCardLikeButtonProps {
  postId: string;
  initialState: LikeInfo;
  className?: string;
  /** Pill layout for home feed action row */
  pill?: boolean;
}

export function FeedCardLikeButton({
  postId,
  initialState,
  className,
  pill = false,
}: FeedCardLikeButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["like-info", postId];

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/likes`).json<LikeInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const { mutate, isPending } = useMutation({
    mutationFn: () =>
      data.isLikedByUser
        ? kyInstance.delete(`/api/posts/${postId}/likes`)
        : kyInstance.post(`/api/posts/${postId}/likes`),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey });

      const previousState = queryClient.getQueryData<LikeInfo>(queryKey);

      queryClient.setQueryData<LikeInfo>(queryKey, () => ({
        likes:
          (previousState?.likes ?? 0) + (previousState?.isLikedByUser ? -1 : 1),
        isLikedByUser: !previousState?.isLikedByUser,
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
  });

  if (pill) {
    return (
      <button
        type="button"
        onClick={() => mutate()}
        disabled={isPending}
        className={cn(
          "flex flex-1 items-center justify-center rounded-[10px] border border-[#2a2a2a] bg-[#1f1f1f] py-[9px] text-center text-[13px] tabular-nums transition-colors disabled:opacity-50",
          data.isLikedByUser
            ? "font-medium text-[#C9F31D]"
            : "text-[#888888] hover:text-white",
          className,
        )}
        aria-label={data.isLikedByUser ? "Unlike post" : "Like post"}
      >
        ♡ {data.likes}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => mutate()}
      disabled={isPending}
      className={cn(
        "flex items-center gap-1.5 text-[#888888] transition-colors hover:text-white disabled:opacity-50",
        className,
      )}
      aria-label={data.isLikedByUser ? "Unlike post" : "Like post"}
    >
      <Heart
        className="h-4 w-4"
        style={
          data.isLikedByUser
            ? { fill: "#C9F31D", color: "#C9F31D" }
            : undefined
        }
      />
      <span className="text-sm tabular-nums">{data.likes}</span>
    </button>
  );
}
