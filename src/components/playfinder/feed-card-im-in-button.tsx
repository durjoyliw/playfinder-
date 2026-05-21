"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import { Check } from "lucide-react";
import { useState } from "react";

interface FeedCardImInButtonProps {
  authorId: string;
  sport?: string;
  location?: string;
  timeLabel?: string;
}

export function FeedCardImInButton({
  authorId,
  sport,
  location,
  timeLabel,
}: FeedCardImInButtonProps) {
  const { user } = useSession();
  const { toast } = useToast();
  const [joined, setJoined] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const isOwnPost = user.id === authorId;

  const handleClick = async () => {
    if (joined || isSending || isOwnPost) return;

    setIsSending(true);

    try {
      await kyInstance.post("/api/messages/im-in", {
        json: {
          authorId,
          sport,
          location,
          timeLabel,
        },
      });

      setJoined(true);
      toast({
        description: "Message sent! Check your DMs.",
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to send message. Please try again.",
      });
    } finally {
      setIsSending(false);
    }
  };

  if (isOwnPost) {
    return null;
  }

  if (joined) {
    return (
      <button
        type="button"
        disabled
        className="flex items-center gap-2 rounded-full bg-[#1f1f1f] px-4 py-2 text-sm font-semibold text-[#C9F31D]"
      >
        <Check className="h-4 w-4" />
        Joined
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isSending}
      className="flex items-center gap-2 rounded-full bg-[#C9F31D] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-60"
    >
      👋 {isSending ? "Sending..." : "I'm in"}
    </button>
  );
}
