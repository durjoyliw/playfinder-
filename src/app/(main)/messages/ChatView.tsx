"use client";

import { Channel } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { ChatComposerProvider } from "./chat-composer-context";
import ChannelHeader from "./ChannelHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";
import MessageRequestActions from "./MessageRequestActions";

interface ChatViewProps {
  channel: StreamChannel;
}

export default function ChatView({ channel }: ChatViewProps) {
  return (
    <Channel channel={channel}>
      <ChatComposerProvider>
        <div className="flex h-full min-h-0 flex-col overflow-hidden bg-[#0d0d0d]">
          <div className="flex-shrink-0">
            <ChannelHeader />
          </div>
          <div className="relative min-h-0 flex-1">
            <div className="absolute inset-0 overflow-y-auto overflow-x-hidden px-4">
              <ChatMessageList />
            </div>
          </div>
          <div className="flex-shrink-0 border-t border-[#1e1e1e]">
            <MessageRequestActions />
            <ChatInput />
          </div>
        </div>
      </ChatComposerProvider>
    </Channel>
  );
}
