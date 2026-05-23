"use client";

import { useToast } from "@/components/ui/use-toast";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Loader2, Search, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChatContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { getInitials } from "./messages-utils";

interface NewChatDialogProps {
  onOpenChange: (open: boolean) => void;
}

interface SearchUser {
  id: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
}

export default function NewChatDialog({ onOpenChange }: NewChatDialogProps) {
  const router = useRouter();
  const { client } = useChatContext();
  const { toast } = useToast();
  const { user: loggedInUser } = useSession();
  const [searchInput, setSearchInput] = useState("");
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

  const startChatMutation = useMutation({
    mutationFn: async (recipient: SearchUser) => {
      await kyInstance.post("/api/messages/prepare-dm", {
        json: { recipientId: recipient.id },
      });

      const channel = client.channel("messaging", {
        members: [loggedInUser.id, recipient.id],
      });
      await channel.watch();
      return channel;
    },
    onSuccess: (channel) => {
      onOpenChange(false);
      if (channel.id) {
        router.push(`/messages/${encodeURIComponent(channel.id)}`);
      }
    },
    onError() {
      toast({
        variant: "destructive",
        description: "Could not start chat. Please try again.",
      });
    },
  });

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="new-message-title"
    >
      <button
        type="button"
        className="absolute inset-0"
        aria-label="Close"
        onClick={() => onOpenChange(false)}
      />
      <div className="relative z-10 w-full max-w-[400px] rounded-2xl bg-[#161616] p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 id="new-message-title" className="text-lg font-bold text-white">
            New Message
          </h2>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="rounded-full p-1 text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search players..."
            className="w-full rounded-full bg-[#1a1a1a] py-2.5 pl-10 pr-4 text-sm text-white placeholder:text-[#888888] focus:outline-none"
            autoFocus
          />
        </div>

        <div className="max-h-72 overflow-y-auto overflow-x-hidden">
          {!searchDebounced.trim() && (
            <p className="py-6 text-center text-sm text-[#888888]">
              Type a name to find players
            </p>
          )}
          {isFetching && (
            <div className="flex justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-[#C9F31D]" />
            </div>
          )}
          {isError && (
            <p className="py-6 text-center text-sm text-red-400">
              Could not load players.
            </p>
          )}
          {data?.map((player) => (
            <button
              key={player.id}
              type="button"
              disabled={startChatMutation.isPending}
              onClick={() => startChatMutation.mutate(player)}
              className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-[#1a1a1a] disabled:opacity-50"
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-xs font-bold text-black">
                {player.avatarUrl ? (
                  <img
                    src={player.avatarUrl}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  getInitials(player.displayName)
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate font-bold text-white">
                  {player.displayName}
                </p>
                <p className="truncate text-sm text-[#888888]">
                  @{player.username}
                </p>
              </div>
            </button>
          ))}
          {searchDebounced && !isFetching && data?.length === 0 && (
            <p className="py-6 text-center text-sm text-[#888888]">
              No players found
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
