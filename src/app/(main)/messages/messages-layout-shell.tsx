"use client";

import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Suspense } from "react";
import ConversationsList from "./ChatSidebar";
import { PendingDmProvider } from "./pending-dm-context";
import StreamChatProvider from "./StreamChatProvider";
import { useStreamUserSync } from "./useStreamUserSync";

function MessagesLayoutInner({ children }: { children: React.ReactNode }) {
  useStreamUserSync();
  const pathname = usePathname();
  // The one ConversationsList: the full-width inbox on mobile /messages, the
  // left column on desktop, hidden behind an open thread on mobile.
  const isInbox = pathname === "/messages";
  return (
    <PendingDmProvider>
      <div className="flex h-full min-h-0 flex-1 overflow-hidden">
        <div
          className={cn(
            "h-full min-h-0 flex-col overflow-hidden lg:flex lg:w-[420px] lg:flex-shrink-0 lg:border-r lg:border-[var(--pf-c-line-1a1a1a)]",
            isInbox ? "flex w-full" : "hidden",
          )}
        >
          <ConversationsList />
        </div>
        <div
          className={cn(
            "h-full min-h-0 flex-1 flex-col overflow-hidden",
            isInbox ? "hidden lg:flex" : "flex",
          )}
        >
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
    <div className="playfinder-messages flex h-full min-h-0 w-full flex-1 flex-col overflow-hidden bg-[var(--pf-bg)]">
      <StreamChatProvider>
        <Suspense fallback={null}>
          <MessagesLayoutInner>{children}</MessagesLayoutInner>
        </Suspense>
      </StreamChatProvider>
    </div>
  );
}
