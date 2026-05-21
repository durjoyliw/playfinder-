"use client";

import { Suspense, useState } from "react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";
import { PendingDmProvider } from "./pending-dm-context";
import { useStreamUserSync } from "./useStreamUserSync";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  useStreamUserSync();

  return (
    <Suspense fallback={null}>
      <PendingDmProvider>
        <div className="flex h-[min(520px,calc(100dvh-14rem))] w-full flex-col overflow-hidden rounded-2xl bg-[#161616] shadow-sm">
          <div className="flex min-h-0 flex-1">
            <ChatSidebar
              open={sidebarOpen}
              onClose={() => setSidebarOpen(false)}
            />
            <ChatChannel
              open={!sidebarOpen}
              openSidebar={() => setSidebarOpen(true)}
            />
          </div>
        </div>
      </PendingDmProvider>
    </Suspense>
  );
}
