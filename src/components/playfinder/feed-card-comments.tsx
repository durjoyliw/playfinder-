"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { CommentData, CommentsPage } from "@/lib/types";
import { formatRelativeDate } from "@/lib/utils";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { Loader2, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function getInitials(displayName: string): string {
  return displayName
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

interface FeedCardCommentItemProps {
  comment: CommentData;
}

function FeedCardCommentItem({ comment }: FeedCardCommentItemProps) {
  return (
    <div className="flex gap-2.5 rounded-lg border border-[#2a2a2a] bg-[#161616] p-3">
      <Link
        href={`/users/${comment.user.username}`}
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[#2a2a2a] text-xs font-bold text-white transition-opacity hover:opacity-80"
      >
        {getInitials(comment.user.displayName)}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="mb-0.5 flex items-center gap-2">
          <Link
            href={`/users/${comment.user.username}`}
            className="text-sm font-semibold text-white hover:underline"
          >
            {comment.user.displayName}
          </Link>
          <span className="text-xs text-muted-foreground">
            {formatRelativeDate(comment.createdAt)}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-gray-300">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

interface FeedCardCommentsProps {
  postId: string;
  initialReplyCount?: number;
}

export function FeedCardComments({
  postId,
  initialReplyCount = 0,
}: FeedCardCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, fetchNextPage, hasNextPage, isFetching, status } =
    useInfiniteQuery({
      queryKey: ["comments", postId],
      queryFn: ({ pageParam }) =>
        kyInstance
          .get(
            `/api/posts/${postId}/comments`,
            pageParam ? { searchParams: { cursor: pageParam } } : {},
          )
          .json<CommentsPage>(),
      initialPageParam: null as string | null,
      getNextPageParam: (firstPage) => firstPage.previousCursor,
      select: (queryData) => ({
        pages: [...queryData.pages].reverse(),
        pageParams: [...queryData.pageParams].reverse(),
      }),
      enabled: isOpen,
    });

  const submitMutation = useMutation({
    mutationFn: (content: string) =>
      kyInstance
        .post(`/api/posts/${postId}/comments`, { json: { content } })
        .json<CommentData>(),
    onSuccess: (newComment) => {
      const queryKey = ["comments", postId];

      queryClient.setQueryData(
        queryKey,
        (oldData: { pages: CommentsPage[]; pageParams: (string | null)[] } | undefined) => {
          if (!oldData?.pages.length) {
            return {
              pageParams: [null],
              pages: [{ comments: [newComment], previousCursor: null }],
            };
          }

          const lastPage = oldData.pages[oldData.pages.length - 1];
          return {
            pageParams: oldData.pageParams,
            pages: [
              ...oldData.pages.slice(0, -1),
              {
                ...lastPage,
                comments: [...lastPage.comments, newComment],
              },
            ],
          };
        },
      );

      setInput("");
      toast({ description: "Reply posted" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to post reply. Please try again.",
      });
    },
  });

  const comments = data?.pages.flatMap((page) => page.comments) ?? [];
  const replyLabel =
    initialReplyCount > 0
      ? `${initialReplyCount} ${initialReplyCount === 1 ? "reply" : "replies"}`
      : "Reply";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || submitMutation.isPending) return;
    submitMutation.mutate(trimmed);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div className="border-t border-border">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="flex w-full items-center gap-1.5 px-0 py-3 text-muted-foreground transition-colors hover:text-white"
      >
        <MessageCircle className="h-4 w-4" />
        <span className="text-sm">
          {isOpen ? "Hide replies" : replyLabel}
        </span>
      </button>

      {isOpen && (
        <div className="space-y-3 pb-4">
          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a reply..."
              className="flex-1 rounded-lg border border-[#2a2a2a] bg-[#161616] px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-[#C9F31D] focus:outline-none"
            />
            <button
              type="submit"
              disabled={!input.trim() || submitMutation.isPending}
              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-[#C9F31D] text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-50"
              aria-label="Send reply"
            >
              {submitMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </button>
          </form>

          {hasNextPage && (
            <button
              type="button"
              onClick={() => fetchNextPage()}
              disabled={isFetching}
              className="text-xs text-[#C9F31D] hover:underline disabled:opacity-50"
            >
              Load earlier replies
            </button>
          )}

          {status === "pending" && (
            <div className="flex justify-center py-2">
              <Loader2 className="h-5 w-5 animate-spin text-[#C9F31D]" />
            </div>
          )}

          {status === "success" && !comments.length && (
            <p className="text-center text-xs text-muted-foreground">
              No replies yet. Be the first!
            </p>
          )}

          {status === "error" && (
            <p className="text-center text-xs text-red-400">
              Failed to load replies.
            </p>
          )}

          <div className="space-y-2">
            {comments.map((comment) => (
              <FeedCardCommentItem key={comment.id} comment={comment} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
