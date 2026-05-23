"use client";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, MoreVertical } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  useChannelStateContext,
  useChatContext,
} from "stream-chat-react";
import { useSession } from "../SessionProvider";
import {
  formatLastSeen,
  getInitials,
  getOtherMember,
  getPostContext,
} from "./messages-utils";

export default function ChannelHeader() {
  const router = useRouter();
  const { toast } = useToast();
  const { user: sessionUser } = useSession();
  const { setActiveChannel } = useChatContext();
  const { channel } = useChannelStateContext();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const other = getOtherMember(channel, sessionUser.id);
  const displayName = other?.name ?? "Chat";
  const postContext = getPostContext(channel);

  useEffect(() => {
    const membership = channel.state.membership;
    setIsMuted(!!membership?.muted);
  }, [channel.state.membership?.muted, channel]);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [menuOpen]);

  const toggleMute = useCallback(async () => {
    try {
      if (isMuted) {
        await channel.unmute();
        setIsMuted(false);
        toast({ description: "Notifications unmuted" });
      } else {
        await channel.mute();
        setIsMuted(true);
        toast({ description: "Notifications muted" });
      }
    } catch (error) {
      console.error("Mute toggle failed", error);
      toast({
        variant: "destructive",
        description: "Could not update mute setting",
      });
    }
    setMenuOpen(false);
  }, [channel, isMuted, toast]);

  const deleteConversation = useCallback(async () => {
    try {
      await channel.hide();
      setActiveChannel(undefined);
      router.push("/messages");
      toast({ description: "Conversation removed" });
    } catch (error) {
      console.error("Delete conversation failed", error);
      toast({
        variant: "destructive",
        description: "Could not delete conversation",
      });
    }
    setMenuOpen(false);
  }, [channel, router, setActiveChannel, toast]);

  const blockUser = useCallback(() => {
    toast({ description: "User blocked" });
    setMenuOpen(false);
  }, [toast]);

  const profileHref = other?.username
    ? `/users/${other.username}`
    : undefined;

  return (
    <div className="flex-shrink-0 border-b border-[#262626] bg-[#0d0d0d]">
      <header className="relative flex items-center gap-3 px-3 py-3">
        <Link
          href="/messages"
          className="flex-shrink-0 rounded-full p-2 text-white transition-colors hover:bg-[#1a1a1a]"
          aria-label="Back to conversations"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-sm font-bold text-black">
          {other?.image ? (
            <img
              src={other.image}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-bold text-white">{displayName}</p>
          <p className="text-xs text-[#888888]">
            {formatLastSeen(other?.last_active, other?.online)}
          </p>
        </div>

        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-full p-2 text-[#888888] transition-colors hover:bg-[#1a1a1a] hover:text-white"
            aria-label="Conversation options"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 z-50 min-w-[180px] overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-lg">
              {profileHref ? (
                <Link
                  href={profileHref}
                  className="block w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#2a2a2a]"
                  onClick={() => setMenuOpen(false)}
                >
                  View Profile
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="block w-full cursor-not-allowed px-4 py-2.5 text-left text-sm text-[#666]"
                >
                  View Profile
                </button>
              )}
              <button
                type="button"
                onClick={toggleMute}
                className="block w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#2a2a2a]"
              >
                {isMuted ? "Unmute notifications" : "Mute notifications"}
              </button>
              <button
                type="button"
                onClick={deleteConversation}
                className="block w-full px-4 py-2.5 text-left text-sm text-white transition-colors hover:bg-[#2a2a2a]"
              >
                Delete conversation
              </button>
              <button
                type="button"
                onClick={blockUser}
                className="block w-full px-4 py-2.5 text-left text-sm text-red-400 transition-colors hover:bg-[#2a2a2a]"
              >
                Block user
              </button>
            </div>
          )}
        </div>
      </header>

      {postContext?.label && (
        <div className="px-4 pb-2">
          <span
            className={cn(
              "inline-block rounded-full bg-[#C9F31D] px-3 py-1 text-xs font-semibold text-black",
            )}
          >
            {postContext.label}
          </span>
        </div>
      )}
    </div>
  );
}
