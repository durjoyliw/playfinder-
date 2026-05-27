"use client";

import kyInstance from "@/lib/ky";
import type { StreamChat, Channel } from "stream-chat";

interface OpenDmOptions {
  client: StreamChat;
  currentUserId: string;
  targetUserId: string;
}

export type OpenDmResult =
  | { type: "channel"; channel: Channel; isRequest: boolean }
  | { type: "blocked" }
  | { type: "error" };

export async function openOrRequestDm({
  client,
  currentUserId,
  targetUserId,
}: OpenDmOptions): Promise<OpenDmResult> {
  try {
    const data = await kyInstance
      .post("/api/messages/request", { json: { toUserId: targetUserId } })
      .json<{ isTeammate?: boolean; error?: string; channelId?: string }>();

    if (data.error === "blocked") {
      return { type: "blocked" };
    }

    if (data.isTeammate) {
      await kyInstance.post("/api/messages/prepare-dm", {
        json: { recipientId: targetUserId },
      });

      const channel = client.channel("messaging", {
        members: [currentUserId, targetUserId],
      });
      await channel.watch();
      await channel.updatePartial({ set: { isTeammate: true, pending: false } });
      return { type: "channel", channel, isRequest: false };
    }

    if (data.channelId) {
      const channel = client.channel("messaging", data.channelId);
      await channel.watch();
      return { type: "channel", channel, isRequest: true };
    }

    return { type: "error" };
  } catch (error) {
    const httpError = error as { response?: Response };
    if (httpError.response?.status === 403) {
      return { type: "blocked" };
    }
    console.error("Failed to open or request DM", error);
    return { type: "error" };
  }
}
