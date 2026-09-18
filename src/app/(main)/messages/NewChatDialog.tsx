"use client";

import { useToast } from "@/components/ui/use-toast";
import useDebounce from "@/hooks/useDebounce";
import kyInstance from "@/lib/ky";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ArrowLeft, Check, Loader2, Search, X } from "lucide-react";
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

type Step = "select" | "name";

export default function NewChatDialog({ onOpenChange }: NewChatDialogProps) {
  const router = useRouter();
  const { client } = useChatContext();
  const { toast } = useToast();
  const { user: loggedInUser } = useSession();
  const [searchInput, setSearchInput] = useState("");
  const [selected, setSelected] = useState<SearchUser[]>([]);
  const [step, setStep] = useState<Step>("select");
  const [groupName, setGroupName] = useState("");
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

  const toggleSelected = (candidate: SearchUser) => {
    setSelected((prev) =>
      prev.some((p) => p.id === candidate.id)
        ? prev.filter((p) => p.id !== candidate.id)
        : [...prev, candidate],
    );
  };

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

  const createGroupMutation = useMutation({
    mutationFn: async () => {
      const res = await kyInstance
        .post("/api/messages/prepare-group", {
          json: {
            memberIds: selected.map((s) => s.id),
            name: groupName.trim() || undefined,
          },
        })
        .json<{ channelId?: string; error?: string }>();

      if (!res.channelId)
        throw new Error(res.error ?? "Failed to create group");

      const channel = client.channel("messaging", res.channelId);
      await channel.watch();
      return channel;
    },
    onSuccess: (channel) => {
      onOpenChange(false);
      if (channel.id) {
        router.push(`/messages/${encodeURIComponent(channel.id)}`);
      }
    },
    onError(error) {
      toast({
        variant: "destructive",
        description:
          error instanceof Error
            ? error.message
            : "Could not create group. Please try again.",
      });
    },
  });

  const handlePrimaryAction = () => {
    if (selected.length === 1) {
      startChatMutation.mutate(selected[0]);
    } else if (selected.length >= 2) {
      setStep("name");
    }
  };

  const isPending =
    startChatMutation.isPending || createGroupMutation.isPending;

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
        {step === "select" ? (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2
                id="new-message-title"
                className="text-lg font-bold text-white"
              >
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

            {selected.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-1.5">
                {selected.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleSelected(s)}
                    className="flex items-center gap-1.5 rounded-full bg-[#A1C217]/15 py-1 pl-1 pr-2.5 text-xs font-semibold text-[#A1C217]"
                  >
                    <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#A1C217] text-[9px] font-bold text-black">
                      {s.avatarUrl ? (
                        <img
                          src={s.avatarUrl}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(s.displayName)
                      )}
                    </span>
                    {s.displayName}
                    <X className="h-3 w-3" />
                  </button>
                ))}
              </div>
            )}

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
                  Type a name to find players. Pick more than one to start a
                  group.
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
              {data?.map((player) => {
                const isSelected = selected.some((s) => s.id === player.id);
                return (
                  <button
                    key={player.id}
                    type="button"
                    onClick={() => toggleSelected(player)}
                    className="flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left transition-colors hover:bg-[#1a1a1a]"
                  >
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#A1C217] text-xs font-bold text-black">
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
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-white">
                        {player.displayName}
                      </p>
                      <p className="truncate text-sm text-[#888888]">
                        @{player.username}
                      </p>
                    </div>
                    <span
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${
                        isSelected
                          ? "border-[#A1C217] bg-[#A1C217]"
                          : "border-[#444]"
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-black" />}
                    </span>
                  </button>
                );
              })}
              {searchDebounced && !isFetching && data?.length === 0 && (
                <p className="py-6 text-center text-sm text-[#888888]">
                  No players found
                </p>
              )}
            </div>

            <button
              type="button"
              disabled={selected.length === 0 || isPending}
              onClick={handlePrimaryAction}
              className="mt-4 w-full rounded-full bg-[#A1C217] py-3 text-sm font-bold text-black transition-opacity disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : selected.length >= 2 ? (
                `Next (${selected.length})`
              ) : (
                "Chat"
              )}
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setStep("select")}
                className="rounded-full p-1 text-[#888888] hover:bg-[#1a1a1a] hover:text-white"
                aria-label="Back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-lg font-bold text-white">New Group</h2>
            </div>

            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#888888]">
              {selected.length} people
            </p>
            <div className="mb-4 flex flex-wrap gap-1.5">
              {selected.map((s) => (
                <span
                  key={s.id}
                  className="flex items-center gap-1.5 rounded-full bg-[#1a1a1a] py-1 pl-1 pr-2.5 text-xs font-semibold text-white"
                >
                  <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#A1C217] text-[9px] font-bold text-black">
                    {s.avatarUrl ? (
                      <img
                        src={s.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(s.displayName)
                    )}
                  </span>
                  {s.displayName}
                </span>
              ))}
            </div>

            <label
              htmlFor="group-name"
              className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#888888]"
            >
              Group name (optional)
            </label>
            <input
              id="group-name"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder={selected.map((s) => s.displayName).join(", ")}
              className="mb-4 w-full rounded-xl bg-[#1a1a1a] px-4 py-2.5 text-sm text-white placeholder:text-[#666] focus:outline-none"
              autoFocus
            />

            <button
              type="button"
              disabled={isPending}
              onClick={() => createGroupMutation.mutate()}
              className="w-full rounded-full bg-[#A1C217] py-3 text-sm font-bold text-black transition-opacity disabled:opacity-40"
            >
              {isPending ? (
                <Loader2 className="mx-auto h-4 w-4 animate-spin" />
              ) : (
                "Create group"
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
