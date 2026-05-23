"use client";

import { Channel } from "stream-chat-react";
import type { Channel as StreamChannel } from "stream-chat";
import { ChatComposerProvider } from "./chat-composer-context";
import ChannelHeader from "./ChannelHeader";
import ChatInput from "./ChatInput";
import ChatMessageList from "./ChatMessageList";

interface ChatViewProps {
  channel: StreamChannel;
}

export default function ChatView({ channel }: ChatViewProps) {
  return (
    <Channel channel={channel}>
      <ChatComposerProvider>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d]">
          <ChannelHeader />
          <ChatMessageList />
          <ChatInput />
        </div>
      </ChatComposerProvider>
    </Channel>
  );
}
