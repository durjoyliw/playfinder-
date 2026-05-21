"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Loader2, Send } from "lucide-react";
import { useEffect, useState } from "react";
import { MessageInput, useChannelStateContext } from "stream-chat-react";
import { usePendingDmDraft } from "./pending-dm-context";

export default function DraftMessageInput() {
  const { draft, clearDraft } = usePendingDmDraft();

  if (!draft) {
    return <MessageInput />;
  }

  return <PrefilledMessageInput initialDraft={draft} onClearDraft={clearDraft} />;
}

interface PrefilledMessageInputProps {
  initialDraft: string;
  onClearDraft: () => void;
}

function PrefilledMessageInput({
  initialDraft,
  onClearDraft,
}: PrefilledMessageInputProps) {
  const { channel } = useChannelStateContext();
  const [text, setText] = useState(initialDraft);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setText(initialDraft);
  }, [initialDraft]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const trimmed = text.trim();
    if (!trimmed || isSending) return;

    setIsSending(true);
    try {
      await channel.sendMessage({ text: trimmed });
      setText("");
      onClearDraft();
    } catch (error) {
      console.error("Failed to send message", error);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="str-chat__input-flat str-chat__message-input flex items-end gap-2 border-t border-border bg-card p-3"
    >
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSubmit(e);
          }
        }}
        rows={2}
        className={cn(
          "min-h-[44px] flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm",
          "focus:border-primary focus:outline-none",
        )}
        placeholder="Type your message..."
      />
      <Button
        type="submit"
        size="icon"
        disabled={!text.trim() || isSending}
        className="flex-shrink-0"
      >
        {isSending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
      </Button>
    </form>
  );
}
