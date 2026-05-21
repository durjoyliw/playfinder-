"use client";

import { Loader2 } from "lucide-react";
import { useTheme } from "next-themes";
import { Chat as StreamChatReact } from "stream-chat-react";
import useInitializeChatClient from "./useInitializeChatClient";

interface StreamChatProviderProps {
  children: React.ReactNode;
}

export default function StreamChatProvider({
  children,
}: StreamChatProviderProps) {
  const initState = useInitializeChatClient();
  const { resolvedTheme } = useTheme();

  if (initState.status === "loading") {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-[320px] items-center justify-center rounded-2xl bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (initState.status === "error") {
    return (
      <div className="flex h-[calc(100dvh-8.5rem)] min-h-[320px] items-center justify-center rounded-2xl bg-card p-6 text-center">
        <p className="text-sm text-muted-foreground">{initState.message}</p>
      </div>
    );
  }

  return (
    <StreamChatReact
      client={initState.client}
      className="flex h-full min-h-0 flex-1 flex-col"
      theme={
        resolvedTheme === "dark"
          ? "str-chat__theme-dark"
          : "str-chat__theme-light"
      }
    >
      {children}
    </StreamChatReact>
  );
}
