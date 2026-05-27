"use client";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Camera, ImageIcon, Loader2, Mic, Send } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useChannelStateContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { useChatComposer } from "./chat-composer-context";
import { usePendingDmDraft } from "./pending-dm-context";

const MAX_TEXTAREA_LINES = 4;
const LINE_HEIGHT_PX = 22;

export default function ChatInput() {
  const { toast } = useToast();
  const { user } = useSession();
  const { draft, clearDraft } = usePendingDmDraft();
  const { channel } = useChannelStateContext();
  const { registerFillInput, scrollToBottom } = useChatComposer();
  const [text, setText] = useState(draft ?? "");
  const [isSending, setIsSending] = useState(false);
  const [, setChannelRevision] = useState(0);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const onChannelUpdated = () => {
      setChannelRevision((revision) => revision + 1);
    };
    channel.on("channel.updated", onChannelUpdated);
    return () => {
      channel.off("channel.updated", onChannelUpdated);
    };
  }, [channel]);

  const pending = channel.data?.pending === true;
  const messageLocked = channel.data?.messageLocked === true;
  const requestedBy = channel.data?.requestedBy as string | undefined;
  const isRequestReceiver = pending && requestedBy !== user.id;
  const isRequestSender = pending && requestedBy === user.id;
  const inputLocked = pending && isRequestSender && messageLocked;

  useEffect(() => {
    if (draft) setText(draft);
  }, [draft]);

  useEffect(() => {
    registerFillInput((value) => {
      setText(value);
      requestAnimationFrame(() => {
        const el = textareaRef.current;
        if (el) {
          el.focus();
          resizeTextarea(el);
        }
      });
    });
  }, [registerFillInput]);

  const resizeTextarea = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    const maxHeight = LINE_HEIGHT_PX * MAX_TEXTAREA_LINES + 20;
    el.style.height = `${Math.min(el.scrollHeight, maxHeight)}px`;
    el.style.overflowY = el.scrollHeight > maxHeight ? "auto" : "hidden";
  };

  const sendMessage = useCallback(
    async (messageText: string) => {
      const trimmed = messageText.trim();
      if (!trimmed || isSending || inputLocked) return;

      setIsSending(true);
      try {
        await channel.sendMessage({ text: trimmed });
        if (isRequestSender) {
          await channel.updatePartial({ set: { messageLocked: true } });
        }
        setText("");
        clearDraft();
        channel.stopTyping();
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.overflowY = "hidden";
        }
        requestAnimationFrame(() => scrollToBottom());
      } catch (error) {
        console.error("Failed to send message", error);
      } finally {
        setIsSending(false);
      }
    },
    [
      channel,
      clearDraft,
      inputLocked,
      isRequestSender,
      isSending,
      scrollToBottom,
    ],
  );

  const sendText = useCallback(() => {
    void sendMessage(text);
  }, [sendMessage, text]);

  const sendFistBump = useCallback(() => {
    void sendMessage("🤜🤛");
  }, [sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (text.trim()) sendText();
    }
  };

  const handleChange = (value: string) => {
    setText(value);
    if (textareaRef.current) resizeTextarea(textareaRef.current);
    if (value.trim()) {
      channel.keystroke().catch(() => {});
    } else {
      channel.stopTyping().catch(() => {});
    }
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file || inputLocked) return;
    setIsSending(true);
    try {
      await channel.sendImage(file);
      if (isRequestSender) {
        await channel.updatePartial({ set: { messageLocked: true } });
      }
      requestAnimationFrame(() => scrollToBottom());
    } catch (error) {
      console.error("Failed to send image", error);
    } finally {
      setIsSending(false);
    }
  };

  if (isRequestReceiver) {
    return null;
  }

  if (inputLocked) {
    return (
      <div className="bg-[#0d0d0d] px-4 py-3">
        <p className="w-full text-center text-sm text-[#888888]">
          Request sent — waiting for a reply
        </p>
      </div>
    );
  }

  const hasText = text.trim().length > 0;

  return (
    <div className="bg-[#0d0d0d] px-3 py-2.5">
      <div className="flex items-end gap-2">
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            void handleImageFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            void handleImageFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />

        <div className="flex flex-shrink-0 items-center gap-0.5">
          <IconButton
            label="Take photo"
            onClick={() => cameraInputRef.current?.click()}
            disabled={isSending}
          >
            <Camera className="h-5 w-5" />
          </IconButton>
          <IconButton
            label="Choose image"
            onClick={() => galleryInputRef.current?.click()}
            disabled={isSending}
          >
            <ImageIcon className="h-5 w-5" />
          </IconButton>
          <IconButton
            label="Voice note"
            onClick={() =>
              toast({ description: "Voice notes coming soon" })
            }
            disabled={isSending}
          >
            <Mic className="h-5 w-5" />
          </IconButton>
        </div>

        <textarea
          ref={textareaRef}
          value={text}
          rows={1}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => channel.stopTyping().catch(() => {})}
          placeholder="Message..."
          className="max-h-[108px] min-w-0 flex-1 resize-none rounded-full border-none bg-[#1a1a1a] px-4 py-2.5 text-sm leading-[22px] text-white outline-none placeholder:text-[#888888] focus:ring-0"
        />

        {hasText ? (
          <button
            type="button"
            onClick={sendText}
            disabled={isSending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C9F31D] text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-50"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" strokeWidth={2.5} />
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={sendFistBump}
            disabled={isSending}
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#C9F31D] text-xl transition-colors hover:bg-[#d4f73a] disabled:opacity-50"
            aria-label="Send fist bump"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin text-black" />
            ) : (
              <span aria-hidden>🤜</span>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

function IconButton({
  children,
  label,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-[#888888] transition-colors hover:text-white disabled:opacity-50",
      )}
    >
      {children}
    </button>
  );
}
