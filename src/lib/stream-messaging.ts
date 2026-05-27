import streamServerClient from "@/lib/stream";

export interface StreamChatUser {
  id: string;
  displayName: string;
  username: string;
}

export async function upsertStreamUsers(
  sender: StreamChatUser,
  recipient: StreamChatUser,
) {
  await streamServerClient.upsertUsers([
    {
      id: sender.id,
      name: sender.displayName,
      username: sender.username,
    },
    {
      id: recipient.id,
      name: recipient.displayName,
      username: recipient.username,
    },
  ]);
}

export async function ensureDirectMessageChannel(
  senderId: string,
  recipientId: string,
) {
  const channel = streamServerClient.channel("messaging", {
    members: [senderId, recipientId],
  });

  try {
    await channel.create();
  } catch (error) {
    const streamError = error as { code?: number; status?: number };
    if (streamError.code !== 4 && streamError.status !== 409) {
      throw error;
    }
  }

  return channel;
}

export async function createPendingMessageRequestChannel(
  fromUserId: string,
  toUserId: string,
  messageRequestId: string,
) {
  const channel = streamServerClient.channel(
    "messaging",
    messageRequestId,
    {
      members: [fromUserId, toUserId],
      created_by_id: fromUserId,
      pending: true,
      requestedBy: fromUserId,
      messageRequestId,
      messageLocked: false,
    },
  );

  await channel.create();
  return channel;
}
