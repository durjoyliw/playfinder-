"use client";

import { Pencil, Search } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Channel } from "stream-chat";
import {
  ChannelList,
  type ChannelPreviewUIComponentProps,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import kyInstance from "@/lib/ky";
import {
  channelMatchesSearch,
  formatConversationTime,
  getChannelRequestData,
  getInitials,
  getOtherMember,
} from "./messages-utils";
import NewChatDialog from "./NewChatDialog";

type InboxTab = "messages" | "requests";

function isIncomingRequest(channel: Channel, currentUserId: string) {
  const { pending, requestedBy } = getChannelRequestData(channel);
  return pending && requestedBy !== currentUserId;
}

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
  const searchParams = useSearchParams();
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [blockedUserIds, setBlockedUserIds] = useState<Set<string>>(new Set());
  const searchInputRef = useRef<HTMLInputElement>(null);

  const activeTab: InboxTab =
    searchParams.get("tab") === "requests" ? "requests" : "messages";

  useEffect(() => {
    let cancelled = false;
    kyInstance
      .get("/api/users/blocked")
      .json<
        Array<{
          blocked: { id: string };
        }>
      >()
      .then((blocks) => {
        if (cancelled) return;
        setBlockedUserIds(new Set(blocks.map((b) => b.blocked.id)));
      })
      .catch((error) => {
        console.error(error);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const blockedUserIdsMemo = useMemo(() => blockedUserIds, [blockedUserIds]);

  const ChannelPreviewCustom = useCallback(
    (props: ChannelPreviewUIComponentProps) => (
      <ConversationPreview {...props} />
    ),
    [],
  );

  const channelRenderFilterFn = useCallback(
    (channels: Channel[]) =>
      channels.filter((ch) => {
        const incoming = isIncomingRequest(ch, user.id);
        if (activeTab === "requests") {
          if (!incoming) return false;
        } else if (incoming) {
          return false;
        }

        const other = getOtherMember(ch, user.id);
        const otherId = other?.id;
        if (otherId && blockedUserIdsMemo.has(otherId)) {
          return false;
        }

        return channelMatchesSearch(ch, searchQuery, user.id);
      }),
    [activeTab, blockedUserIdsMemo, searchQuery, user.id],
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

      <div className="flex gap-2 px-4 pb-3">
        <TabButton
          active={activeTab === "messages"}
          href="/messages"
          label="Messages"
        />
        <TabButton
          active={activeTab === "requests"}
          href="/messages?tab=requests"
          label="Requests"
        />
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
                : activeTab === "requests"
                  ? "No message requests yet."
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

function TabButton({
  active,
  href,
  label,
}: {
  active: boolean;
  href: string;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-[#C9F31D] text-black"
          : "bg-[#1a1a1a] text-[#888888] hover:text-white"
      }`}
    >
      {label}
    </Link>
  );
}
