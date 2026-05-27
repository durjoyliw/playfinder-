import { validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { randomUUID } from "crypto";
import {
  createPendingMessageRequestChannel,
  upsertStreamUsers,
} from "@/lib/stream-messaging";
import streamServerClient from "@/lib/stream";
import { isTeammate } from "@/lib/teammate";
import { NotificationType } from "@prisma/client";
import { z } from "zod";

const createRequestSchema = z.object({
  toUserId: z.string().min(1),
});

const patchRequestSchema = z.object({
  requestId: z.string().min(1),
  action: z.enum(["ACCEPT", "DECLINE"]),
});

export async function POST(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { toUserId } = createRequestSchema.parse(await req.json());

    if (toUserId === user.id) {
      return Response.json(
        { error: "You cannot message yourself" },
        { status: 400 },
      );
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, displayName: true, username: true },
    });

    if (!targetUser) {
      return Response.json({ error: "User not found" }, { status: 404 });
    }

    const teammate = await isTeammate(user.id, toUserId);
    if (teammate) {
      return Response.json({ isTeammate: true });
    }

    const acceptedRequest = await prisma.messageRequest.findFirst({
      where: {
        OR: [
          {
            fromUserId: user.id,
            toUserId,
            status: "ACCEPTED",
          },
          {
            fromUserId: toUserId,
            toUserId: user.id,
            status: "ACCEPTED",
          },
        ],
      },
    });

    if (acceptedRequest) {
      return Response.json({ isTeammate: true });
    }

    const declinedRequest = await prisma.messageRequest.findFirst({
      where: {
        OR: [
          {
            fromUserId: user.id,
            toUserId,
            status: "DECLINED",
          },
          {
            fromUserId: toUserId,
            toUserId: user.id,
            status: "DECLINED",
          },
        ],
      },
    });

    if (declinedRequest) {
      return Response.json({ error: "blocked" }, { status: 403 });
    }

    const pendingRequest = await prisma.messageRequest.findFirst({
      where: {
        fromUserId: user.id,
        toUserId,
        status: "PENDING",
      },
    });

    if (pendingRequest) {
      return Response.json({
        channelId: pendingRequest.channelId,
        requestId: pendingRequest.id,
      });
    }

    await upsertStreamUsers(
      {
        id: user.id,
        displayName: user.displayName,
        username: user.username,
      },
      {
        id: targetUser.id,
        displayName: targetUser.displayName,
        username: targetUser.username,
      },
    );

    const requestId = randomUUID();

    const channel = await createPendingMessageRequestChannel(
      user.id,
      toUserId,
      requestId,
    );

    const channelId = channel.id;
    if (!channelId) {
      throw new Error("Failed to create Stream channel");
    }

    const messageRequest = await prisma.messageRequest.create({
      data: {
        id: requestId,
        fromUserId: user.id,
        toUserId,
        channelId,
        status: "PENDING",
      },
    });

    await prisma.notification.create({
      data: {
        issuerId: user.id,
        recipientId: toUserId,
        type: NotificationType.MESSAGE_REQUEST,
      },
    });

    return Response.json({
      channelId,
      requestId: messageRequest.id,
    });
  } catch (error) {
    console.error("POST /api/messages/request error:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { user } = await validateRequest();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { requestId, action } = patchRequestSchema.parse(await req.json());

    const messageRequest = await prisma.messageRequest.findUnique({
      where: { id: requestId },
    });

    if (!messageRequest) {
      return Response.json({ error: "Request not found" }, { status: 404 });
    }

    if (messageRequest.toUserId !== user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }

    if (messageRequest.status !== "PENDING") {
      return Response.json({ error: "Request already handled" }, { status: 400 });
    }

    const channel = streamServerClient.channel(
      "messaging",
      messageRequest.channelId,
    );

    if (action === "ACCEPT") {
      await prisma.messageRequest.update({
        where: { id: requestId },
        data: { status: "ACCEPTED" },
      });

      await channel.updatePartial({
        set: { pending: false, messageLocked: false },
      });

      return Response.json({ success: true });
    }

    await prisma.messageRequest.update({
      where: { id: requestId },
      data: { status: "DECLINED" },
    });

    await channel.delete();

    return Response.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/messages/request error:", error);
    return Response.json(
      { error: "Internal server error", details: String(error) },
      { status: 500 },
    );
  }
}
