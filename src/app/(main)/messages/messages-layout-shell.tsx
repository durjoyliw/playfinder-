"use client";

import { Suspense } from "react";
import { PendingDmProvider } from "./pending-dm-context";
import StreamChatProvider from "./StreamChatProvider";
import { useStreamUserSync } from "./useStreamUserSync";

function MessagesLayoutInner({ children }: { children: React.ReactNode }) {
  useStreamUserSync();
  return <PendingDmProvider>{children}</PendingDmProvider>;
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
          <MessagesLayoutInner>
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
              {children}
            </div>
          </MessagesLayoutInner>
        </Suspense>
      </StreamChatProvider>
    </div>
  );
}
