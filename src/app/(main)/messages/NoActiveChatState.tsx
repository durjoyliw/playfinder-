"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import NewChatDialog from "./NewChatDialog";

export function NoActiveChatState() {
  const [showNewChatDialog, setShowNewChatDialog] = useState(false);

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center gap-3.5 bg-[#0d0d0d] p-10 text-center">
      <div className="grid h-16 w-16 place-items-center rounded-full bg-[#1a1a1a] text-[#888888]">
        <MessageCircle className="h-[30px] w-[30px]" strokeWidth={1.75} />
      </div>
      <p className="text-xl font-bold text-white">Start a conversation</p>
      <p className="max-w-[260px] text-sm leading-relaxed text-[#888888]">
        Choose from your existing conversations, or start a new one.
      </p>
      <button
        type="button"
        onClick={() => setShowNewChatDialog(true)}
        className="mt-1.5 rounded-full bg-[#A1C217] px-[22px] py-[11px] text-sm font-bold text-black transition-colors hover:bg-[#aac62e]"
      >
        New message
      </button>
      {showNewChatDialog && (
        <NewChatDialog onOpenChange={setShowNewChatDialog} />
      )}
    </div>
  );
}
