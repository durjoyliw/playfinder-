"use client";

import { Loader2 } from "lucide-react";
import { Chat as StreamChatReact } from "stream-chat-react";
import useInitializeChatClient from "./useInitializeChatClient";

interface StreamChatProviderProps {
  children: React.ReactNode;
}

export default function StreamChatProvider({
  children,
}: StreamChatProviderProps) {
  const initState = useInitializeChatClient();

  if (initState.status === "loading") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#0d0d0d]">
        <Loader2 className="h-8 w-8 animate-spin text-[#C9F31D]" />
      </div>
    );
  }

  if (initState.status === "error") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[#0d0d0d] p-6 text-center">
        <p className="text-sm text-gray-500">{initState.message}</p>
      </div>
    );
  }

  return (
    <StreamChatReact
      client={initState.client}
      className="playfinder-messages str-chat flex h-full min-h-0 flex-1 flex-col"
      theme="str-chat__theme-dark"
    >
      {children}
    </StreamChatReact>
  );
}
