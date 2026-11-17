"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { BookmarkInfo } from "@/lib/types";
import { cn } from "@/lib/utils";
import {
  QueryKey,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { Bookmark } from "lucide-react";
import { useState } from "react";

/** React Query key for the Saved page list (invalidated on save/unsave). */
export const SAVED_POSTS_QUERY_KEY: QueryKey = ["post-feed", "saved"];

interface FeedCardSaveButtonProps {
  postId: string;
  initialState: BookmarkInfo;
  className?: string;
  /** Icon size in px (matches the neighbouring action icons). */
  iconSize?: number;
}

/**
 * Save (bookmark) toggle for post cards. Outline when unsaved, filled in the
 * accent when saved, with a Twitter-style pop on save. Optimistic: the icon
 * flips instantly and rolls back if the request fails. Shares its cache key
 * with every other card showing the same post.
 */
export function FeedCardSaveButton({
  postId,
  initialState,
  className,
  iconSize = 18,
}: FeedCardSaveButtonProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const queryKey: QueryKey = ["bookmark-info", postId];
  // Bumped on each save so the pop animation restarts on every tap.
  const [popKey, setPopKey] = useState(0);

  const { data } = useQuery({
    queryKey,
    queryFn: () =>
      kyInstance.get(`/api/posts/${postId}/bookmark`).json<BookmarkInfo>(),
    initialData: initialState,
    staleTime: Infinity,
  });

  const saved = data.isBookmarkedByUser;

  const { mutate } = useMutation({
    mutationFn: (nextSaved: boolean) =>
      nextSaved
        ? kyInstance.post(`/api/posts/${postId}/bookmark`)
        : kyInstance.delete(`/api/posts/${postId}/bookmark`),
    onMutate: async (nextSaved) => {
      await queryClient.cancelQueries({ queryKey });
      const previousState = queryClient.getQueryData<BookmarkInfo>(queryKey);
      queryClient.setQueryData<BookmarkInfo>(queryKey, {
        isBookmarkedByUser: nextSaved,
      });
      return { previousState };
    },
    onError(error, _nextSaved, context) {
      queryClient.setQueryData(queryKey, context?.previousState);
      console.error(error);
      toast({
        variant: "destructive",
        description: "Couldn't update Saved. Please try again.",
      });
    },
    onSettled() {
      void queryClient.invalidateQueries({ queryKey: SAVED_POSTS_QUERY_KEY });
    },
  });

  return (
    <button
      type="button"
      onClick={() => {
        const next = !saved;
        if (next) setPopKey((k) => k + 1);
        mutate(next);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove from Saved" : "Save post"}
      className={cn(
        "relative flex min-h-9 items-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)] rounded-md",
        saved
          ? "text-[var(--pf-volt-text)]"
          : "text-[var(--pf-c-ink-7e8a7e)] hover:text-[var(--pf-c-ink-f2f5ef)]",
        className,
      )}
    >
      <span
        key={popKey}
        className={cn("relative grid place-items-center", popKey > 0 && saved && "pf-save-pop")}
      >
        {popKey > 0 && saved && <span className="pf-save-burst" aria-hidden />}
        <Bookmark
          style={{ width: iconSize, height: iconSize }}
          className={cn(saved && "fill-[var(--pf-volt)] text-[var(--pf-volt)]")}
        />
      </span>
    </button>
  );
}
