"use client";

import { useState } from "react";
import ChatChannel from "./ChatChannel";
import ChatSidebar from "./ChatSidebar";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl bg-card shadow-sm">
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
  );
}
