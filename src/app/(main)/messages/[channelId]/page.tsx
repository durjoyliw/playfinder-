"use client";

import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import type { Channel } from "stream-chat";
import { useChatContext } from "stream-chat-react";
import ChatView from "../ChatView";

export default function ChannelChatPage() {
  const params = useParams();
  const { client, setActiveChannel } = useChatContext();
  const channelId = decodeURIComponent(params.channelId as string);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [channel, setChannel] = useState<Channel | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadChannel() {
      setStatus("loading");
      setChannel(null);
      try {
        const ch = client.channel("messaging", channelId);
        await ch.watch();
        if (!cancelled) {
          setActiveChannel(ch);
          void ch.markRead();
          setChannel(ch);
          setStatus("ready");
        }
      } catch (error) {
        console.error("Failed to load channel", error);
        if (!cancelled) setStatus("error");
      }
    }

    if (client.userID) {
      void loadChannel();
    }

    return () => {
      cancelled = true;
    };
  }, [channelId, client, setActiveChannel]);

  if (status === "loading") {
    return (
      <div className="flex h-full min-h-0 flex-1 items-center justify-center bg-[#0d0d0d]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-4 bg-[#0d0d0d] p-6 text-center">
        <p className="text-sm text-[#888888]">Conversation not found</p>
        <Link
          href="/messages"
          className="rounded-full bg-[#C9F31D] px-4 py-2 text-sm font-bold text-black"
        >
          Back to messages
        </Link>
      </div>
    );
  }

  if (!channel) return null;

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden bg-[#0d0d0d]">
      <ChatView channel={channel} />
    </div>
  );
}
