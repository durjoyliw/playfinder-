"use client";

import kyInstance from "@/lib/ky";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useChannelStateContext, useChatContext } from "stream-chat-react";
import { useSession } from "../SessionProvider";
import { getChannelRequestData, getOtherMember } from "./messages-utils";

export default function MessageRequestActions() {
  const router = useRouter();
  const { user } = useSession();
  const { setActiveChannel } = useChatContext();
  const { channel } = useChannelStateContext();
  const [isLoading, setIsLoading] = useState<"ACCEPT" | "DECLINE" | null>(
    null,
  );

  const { pending, requestedBy, messageRequestId } =
    getChannelRequestData(channel);

  if (!pending || requestedBy === user.id) {
    return null;
  }

  const other = getOtherMember(channel, user.id);
  const displayName = other?.name ?? "this user";

  const handleAction = async (action: "ACCEPT" | "DECLINE") => {
    if (!messageRequestId || isLoading) return;

    setIsLoading(action);
    try {
      await kyInstance.patch("/api/messages/request", {
        json: { requestId: messageRequestId, action },
      });

      if (action === "ACCEPT") {
        await channel.updatePartial({
          set: { pending: false, messageLocked: false },
        });
        if (channel.data) {
          channel.data.pending = false;
          channel.data.messageLocked = false;
        }
        setActiveChannel(channel);
        await channel.watch();
      } else {
        router.push("/messages?tab=requests");
      }
    } catch (error) {
      console.error("Failed to handle message request", error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="flex flex-shrink-0 flex-col gap-2 border-t border-[#262626] bg-[#0d0d0d] px-4 py-3">
      <p className="text-center text-sm text-[#888888]">
        {displayName} wants to message you
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => void handleAction("ACCEPT")}
          className="flex-1 rounded-[20px] bg-[#C9F31D] px-5 py-1.5 text-sm font-bold text-[#0d0d0d] disabled:opacity-50"
        >
          {isLoading === "ACCEPT" ? "Accepting..." : "Accept"}
        </button>
        <button
          type="button"
          disabled={isLoading !== null}
          onClick={() => void handleAction("DECLINE")}
          className="flex-1 rounded-[20px] border border-[#2a2a2a] bg-transparent px-5 py-1.5 text-sm text-[#888888] disabled:opacity-50"
        >
          {isLoading === "DECLINE" ? "Declining..." : "Decline"}
        </button>
      </div>
    </div>
  );
}
