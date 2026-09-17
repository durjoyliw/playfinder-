"use client";

import { Suspense } from "react";
import ConversationsList from "./ChatSidebar";
import { PendingDmProvider } from "./pending-dm-context";
import StreamChatProvider from "./StreamChatProvider";
import { useStreamUserSync } from "./useStreamUserSync";

function MessagesLayoutInner({ children }: { children: React.ReactNode }) {
  useStreamUserSync();
  return (
    <PendingDmProvider>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <div className="hidden h-full min-h-0 w-[420px] flex-shrink-0 flex-col overflow-hidden border-r border-[#1a1a1a] lg:flex">
          <ConversationsList />
        </div>
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
          {children}
        </div>
      </div>
    </PendingDmProvider>
  );
}

export default function MessagesLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="playfinder-messages flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[#0d0d0d]">
      <StreamChatProvider>
        <Suspense fallback={null}>
          <MessagesLayoutInner>{children}</MessagesLayoutInner>
        </Suspense>
      </StreamChatProvider>
    </div>
  );
}
