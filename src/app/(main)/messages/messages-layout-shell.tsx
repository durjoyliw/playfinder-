"use client";

import { Suspense } from "react";
import { PendingDmProvider } from "./pending-dm-context";
import StreamChatProvider from "./StreamChatProvider";
import { useStreamUserSync } from "./useStreamUserSync";

function MessagesLayoutInner({ children }: { children: React.ReactNode }) {
  useStreamUserSync();
  return <PendingDmProvider>{children}</PendingDmProvider>;
}

/** Header ~3.5rem + bottom nav ~5rem */
const MESSAGES_VIEWPORT_HEIGHT = "calc(100dvh - 3.5rem - 5rem)";

export default function MessagesLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="flex w-full justify-center overflow-hidden bg-[#0d0d0d]"
      style={{ height: MESSAGES_VIEWPORT_HEIGHT, minHeight: MESSAGES_VIEWPORT_HEIGHT }}
    >
      <div className="playfinder-messages flex h-full min-h-0 w-full max-w-[480px] flex-col overflow-hidden bg-[#0d0d0d]">
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
    </div>
  );
}
