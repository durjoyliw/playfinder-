"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import type { Channel } from "stream-chat";
import {
  ChannelList,
  type ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import {
  channelMatchesSearch,
  formatConversationTime,
  getInitials,
  getOtherMember,
} from "./messages-utils";
import NewChatDialog from "./NewChatDialog";

function ConversationPreview({
  channel,
}: ChannelPreviewUIComponentProps) {
  const router = useRouter();
  const { user } = useSession();
  const other = getOtherMember(channel, user.id);
  const displayName = other?.name ?? other?.id ?? "Conversation";
  const lastMessage = channel.state.messages?.at(-1);
  const previewText =
    lastMessage?.text ??
    (lastMessage?.attachments?.length ? "Attachment" : "No messages yet");
  const unread = channel.countUnread() ?? 0;
  const lastAt =
    channel.state.last_message_at ??
    lastMessage?.created_at ??
    channel.data?.last_message_at;

  return (
    <button
      type="button"
      onClick={() => {
        void channel.markRead();
        router.push(`/messages/${encodeURIComponent(channel.id ?? "")}`);
      }}
      className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-[#161616] active:bg-[#1f1f1f]"
    >
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-sm font-bold text-black">
        {other?.image ? (
          <img
            src={other.image}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          getInitials(displayName)
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-bold text-white">{displayName}</p>
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {lastAt && (
              <span className="text-xs text-[#888888]">
                {formatConversationTime(
                  lastAt instanceof Date ? lastAt : String(lastAt),
                )}
              </span>
            )}
            {unread > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#C9F31D] px-1 text-[10px] font-bold text-white">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </div>
        </div>
        <p className="truncate text-sm text-[#888888]">{previewText}</p>
      </div>
    </button>
  );
}

export default function ConversationsList() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ConversationPreview {...props} />
    ),
    [],
  );

  const channelRenderFilterFn = useCallback(
    (channels: Channel[]) =>
      channels.filter((ch) =>
        channelMatchesSearch(ch, searchQuery, user.id),
      ),
    [searchQuery, user.id],
  );

  const listFilters = {
    type: "messaging" as const,
    members: { $in: [user.id] },
  };

  return (
    <div className="flex h-full min-h-0 flex-1 w-full flex-col bg-[#0d0d0d]">
      <div className="flex items-center justify-between px-4 pb-2 pt-4">
        <h1 className="text-2xl font-bold text-white">Messages</h1>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => searchInputRef.current?.focus()}
            className="rounded-full p-2 text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            aria-label="Focus search"
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => setShowNewChatDialog(true)}
            className="rounded-full p-2 text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            aria-label="New message"
          >
            <Pencil className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#888888]" />
          <input
            ref={searchInputRef}
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="w-full rounded-full bg-[#1a1a1a] py-2.5 pl-11 pr-4 text-sm text-white placeholder:text-[#888888] focus:outline-none focus:ring-1 focus:ring-[#333]"
            aria-label="Search conversations"
          />
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <ChannelList
          filters={listFilters}
          options={{ state: true, presence: true, limit: 30 }}
          sort={{ last_message_at: -1 }}
          Preview={ChannelPreviewCustom}
          channelRenderFilterFn={channelRenderFilterFn}
          showChannelSearch={false}
          EmptyStateIndicator={() => (
            <p className="px-4 py-8 text-center text-sm text-[#888888]">
              {searchQuery
                ? "No conversations match your search."
                : "No conversations yet. Start a new chat."}
            </p>
          )}
        />
      </div>

      {showNewChatDialog && (
        <NewChatDialog onOpenChange={setShowNewChatDialog} />
      )}
    </div>
  );
}
