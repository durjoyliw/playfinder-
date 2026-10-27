"use client";

import { useIsLightBase } from "@/hooks/use-is-light-base";
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
  // Stream ships separate light/dark themes; follow the background base.
  const isLightBase = useIsLightBase();

  if (initState.status === "loading") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[var(--pf-bg)]">
        <Loader2 className="h-8 w-8 animate-spin text-[var(--pf-volt-text)]" />
      </div>
    );
  }

  if (initState.status === "error") {
    return (
      <div className="flex h-full min-h-[320px] items-center justify-center bg-[var(--pf-bg)] p-6 text-center">
        <p className="text-sm text-[var(--pf-c-ink-6b7280)]">{initState.message}</p>
      </div>
    );
  }

  return (
    <StreamChatReact
      client={initState.client}
      className="playfinder-messages str-chat flex h-full min-h-0 flex-1 flex-col"
      theme={isLightBase ? "str-chat__theme-light" : "str-chat__theme-dark"}
    >
      {children}
    </StreamChatReact>
  );
}
