"use client";

import { cn } from "@/lib/utils";
import { useCallback, useEffect, useRef, useState } from "react";
import type { FormatMessageResponse } from "stream-chat";
import {
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { useChatComposer } from "./chat-composer-context";
import EmptyChatState from "./EmptyChatState";
import MessageContextMenu from "./MessageContextMenu";
import ReactionPicker from "./ReactionPicker";
import {
  emojiForReactionType,
  formatDateSeparator,
  formatMessageTime,
  getInitials,
  getOtherMember,
  isConsecutiveMessage,
  isSameDay,
  streamTypeForEmoji,
} from "./messages-utils";

export default function ChatMessageList() {
  const { user } = useSession();
  const { client } = useChatContext();
  const { channel, messages } = useChannelStateContext();
  const { registerScrollToBottom } = useChatComposer();
  const bottomRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const [reactionTargetId, setReactionTargetId] = useState<string | null>(
    null,
  );
  const [contextMenu, setContextMenu] = useState<{
    message: FormatMessageResponse;
    x: number;
    y: number;
  } | null>(null);

  const other = getOtherMember(channel, user.id);
  const typingUsers = Object.values(channel.state.typing ?? {}).filter(
    (t) => t.user?.id && t.user.id !== user.id,
  );
  const typingName =
    typingUsers[0]?.user?.name ?? typingUsers[0]?.user?.id ?? "Someone";

  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    bottomRef.current?.scrollIntoView({ behavior });
  }, []);

  useEffect(() => {
    registerScrollToBottom(() => scrollToBottom("smooth"));
  }, [registerScrollToBottom, scrollToBottom]);

  useEffect(() => {
    scrollToBottom((messages?.length ?? 0) <= 1 ? "auto" : "smooth");
  }, [messages?.length, messages?.at(-1)?.id, scrollToBottom]);

  const toggleReaction = useCallback(
    async (message: FormatMessageResponse, emoji: string) => {
      const type = streamTypeForEmoji(emoji);
      const own = message.own_reactions?.find((r) => r.type === type);
      try {
        if (own) {
          await client.deleteReaction(message.id, type);
        } else {
          await channel.sendReaction(message.id, { type });
        }
      } catch (error) {
        console.error("Reaction failed", error);
      }
      setReactionTargetId(null);
    },
    [channel, client],
  );

  const openContextMenu = useCallback(
    (message: FormatMessageResponse, clientX: number, clientY: number) => {
      setReactionTargetId(null);
      setContextMenu({ message, x: clientX, y: clientY });
    },
    [],
  );

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const bindLongPress = (message: FormatMessageResponse) => ({
    onTouchStart: (e: React.TouchEvent) => {
      const touch = e.touches[0];
      longPressTimer.current = setTimeout(() => {
        openContextMenu(message, touch.clientX, touch.clientY);
      }, 500);
    },
    onTouchEnd: () => {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
    },
    onContextMenu: (e: React.MouseEvent) => {
      e.preventDefault();
      openContextMenu(message, e.clientX, e.clientY);
    },
  });

  if (messages.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <EmptyChatState />
      </div>
    );
  }

  return (
    <div
      ref={listRef}
      className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-3 py-4"
    >
      {messages.map((message, index) => {
        const prev = messages[index - 1];
        const showDate =
          !prev ||
          !isSameDay(prev.created_at ?? "", message.created_at ?? "");
        const isMe = message.user?.id === user.id;
        const grouped = isConsecutiveMessage(prev, message);
        const showAvatar = !isMe && !grouped;

        return (
          <div key={message.id}>
            {showDate && message.created_at && (
              <p className="my-4 text-center text-xs text-[#888888]">
                {formatDateSeparator(message.created_at)}
              </p>
            )}

            <div
              className={cn(
                "mb-1 flex",
                isMe ? "justify-end" : "justify-start",
                grouped ? "mt-0.5" : "mt-3",
              )}
            >
              {!isMe && (
                <div className="mr-2 w-8 flex-shrink-0">
                  {showAvatar && (
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-xs font-bold text-black">
                      {other?.image ? (
                        <img
                          src={other.image}
                          alt=""
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        getInitials(other?.name ?? "?")
                      )}
                    </div>
                  )}
                </div>
              )}

              <div
                className={cn(
                  "relative max-w-[78%]",
                  isMe ? "items-end" : "items-start",
                )}
              >
                <button
                  type="button"
                  className={cn(
                    "block w-full text-left",
                    isMe
                      ? "rounded-2xl rounded-tr-sm bg-[#C9F31D] px-4 py-2.5 text-black"
                      : "rounded-2xl rounded-tl-sm bg-[#2a2a2a] px-4 py-2.5 text-white",
                  )}
                  onClick={() =>
                    setReactionTargetId((id) =>
                      id === message.id ? null : message.id,
                    )
                  }
                  {...bindLongPress(message)}
                >
                  {message.attachments?.map((att, i) =>
                    att.type === "image" && att.image_url ? (
                      <img
                        key={i}
                        src={att.image_url}
                        alt=""
                        className="mb-1 max-h-48 rounded-lg object-cover"
                      />
                    ) : null,
                  )}
                  {message.text ? (
                    <span className="whitespace-pre-wrap break-words text-sm">
                      {message.text}
                    </span>
                  ) : null}
                </button>

                {reactionTargetId === message.id && (
                  <div
                    className={cn(
                      "absolute z-30",
                      isMe ? "right-0 -top-10" : "left-0 -top-10",
                    )}
                  >
                    <ReactionPicker
                      onSelect={(emoji) => toggleReaction(message, emoji)}
                    />
                  </div>
                )}

                {message.reaction_counts &&
                  Object.keys(message.reaction_counts).length > 0 && (
                    <div
                      className={cn(
                        "mt-1 flex flex-wrap gap-1",
                        isMe ? "justify-end" : "justify-start",
                      )}
                    >
                      {Object.entries(message.reaction_counts).map(
                        ([type, count]) =>
                          count ? (
                            <span
                              key={type}
                              className="inline-flex items-center gap-0.5 rounded-full border border-[#333] bg-[#1a1a1a] px-2 py-0.5 text-xs text-white"
                            >
                              {emojiForReactionType(type)} {count}
                            </span>
                          ) : null,
                      )}
                    </div>
                  )}

                <p
                  className={cn(
                    "mt-0.5 text-[10px] text-[#888888]",
                    isMe ? "text-right" : "text-left",
                  )}
                >
                  {message.created_at
                    ? formatMessageTime(message.created_at)
                    : ""}
                </p>
              </div>
            </div>
          </div>
        );
      })}

      {typingUsers.length > 0 && (
        <p className="mt-2 text-sm italic text-[#888888]">
          {typingName} is typing...
        </p>
      )}

      <div ref={bottomRef} />

      {contextMenu && (
        <MessageContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          isOwn={contextMenu.message.user?.id === user.id}
          onClose={() => setContextMenu(null)}
          onReact={() => {
            setReactionTargetId(contextMenu.message.id);
            setContextMenu(null);
          }}
          onCopy={async () => {
            const text = contextMenu.message.text ?? "";
            if (text) await navigator.clipboard.writeText(text);
            setContextMenu(null);
          }}
          onDelete={async () => {
            try {
              await client.deleteMessage(contextMenu.message.id);
            } catch (error) {
              console.error("Delete message failed", error);
            }
            setContextMenu(null);
          }}
        />
      )}
    </div>
  );
}
