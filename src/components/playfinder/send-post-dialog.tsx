"use client";

import { useToast } from "@/components/ui/use-toast";
import { getInitials } from "@/app/(main)/messages/messages-utils";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, Send, X } from "lucide-react";
import { useState } from "react";

interface SendPostDialogProps {
  postId: string;
  onOpenChange: (open: boolean) => void;
}

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export function SendPostDialog({ postId, onOpenChange }: SendPostDialogProps) {
  const { toast } = useToast();
  const [searchInput, setSearchInput] = useState("");
  const [sentTo, setSentTo] = useState<Set<string>>(new Set());
  const searchDebounced = useDebounce(searchInput);

  const { data, isFetching, isError } = useQuery({
    queryKey: ["users-search", searchDebounced],
    queryFn: async () => {
      const res = await kyInstance
        .get("/api/users/search", { searchParams: { q: searchDebounced } })
        .json<{ users: SearchUser[] }>();
      return res.users;
    },
    enabled: searchDebounced.trim().length > 0,
  });

  const sendMutation = useMutation({
    mutationFn: async (recipient: SearchUser) => {
      await kyInstance.post(`/api/posts/${postId}/send`, {
        json: { recipientId: recipient.id },
      });
      return recipient;
    },
    onSuccess: (recipient) => {
      setSentTo((prev) => new Set(prev).add(recipient.id));
      toast({ description: `Sent to ${recipient.displayName}` });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Could not send. Please try again.",
      });
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="send-post-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl bg-[#161816] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="send-post-title" className="text-lg font-bold text-[#f2f5ef]">
            Send Post
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-[#7e8a7e] hover:bg-[#1e211e] hover:text-[#f2f5ef]"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#7e8a7e]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-full bg-[#1e211e] py-2.5 pl-10 pr-4 text-sm text-[#f2f5ef] placeholder:text-[#7e8a7e] focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto overflow-x-hidden">
          {!searchDebounced.trim() && (
            <p className="py-6 text-center text-sm text-[#7e8a7e]">
              Type a name to find someone to send this post to
            </p>
          )}
          {isFetching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#A1C217]" />
            </div>
          )}
          {isError && (
            <p className="py-6 text-center text-sm text-red-400">
              Could not load players.
            </p>
          )}
          {data?.map((recipient) => {
            const alreadySent = sentTo.has(recipient.id);
            return (
              <button
                key={recipient.id}
                type="button"
                disabled={sendMutation.isPending || alreadySent}
                onClick={() => sendMutation.mutate(recipient)}
                className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-[#1e211e] disabled:opacity-60"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A1C217] text-xs font-bold text-black">
                  {recipient.avatarUrl ? (
                    <img
                      src={recipient.avatarUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    getInitials(recipient.displayName)
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold text-[#f2f5ef]">
                    {recipient.displayName}
                  </p>
                  <p className="truncate text-sm text-[#7e8a7e]">
                    @{recipient.username}
                  </p>
                </div>
                {alreadySent ? (
                  <span className="flex-shrink-0 text-xs font-semibold text-[#A1C217]">
                    Sent
                  </span>
                ) : (
                  <Send className="h-4 w-4 flex-shrink-0 text-[#7e8a7e]" />
                )}
              </button>
            );
          })}
          {searchDebounced && !isFetching && data?.length === 0 && (
            <p className="py-6 text-center text-sm text-[#7e8a7e]">
              No players found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
