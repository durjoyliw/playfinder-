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

export async function upsertStreamUsersMany(users: StreamChatUser[]) {
  await streamServerClient.upsertUsers(
    users.map((u) => ({
      id: u.id,
      name: u.displayName,
      username: u.username,
    })),
  );
}

export async function createGroupChannel(
  creatorId: string,
  memberIds: string[],
  name: string | undefined,
) {
  const channel = streamServerClient.channel("messaging", {
    members: Array.from(new Set([creatorId, ...memberIds])),
    created_by_id: creatorId,
    name: name?.trim() || undefined,
  });

  await channel.create();
  return channel;
}

export async function createPendingMessageRequestChannel(
  fromUserId: string,
  toUserId: string,
  messageRequestId: string,
) {
  const channel = streamServerClient.channel("messaging", messageRequestId, {
    members: [fromUserId, toUserId],
    created_by_id: fromUserId,
    pending: true,
    requestedBy: fromUserId,
    messageRequestId,
    messageLocked: false,
  });

  await channel.create();
  return channel;
}

/** Deterministic Stream channel id for a Page (`page_<cuid>`). */
export function pageChannelId(pageId: string) {
  return `page_${pageId}`;
}

/**
 * Ensure a messaging channel exists for a Page. Idempotent: if the channel
 * already exists (409 / code 4), continues and still assigns the owner role.
 */
export async function ensurePageChannel(opts: {
  pageId: string;
  ownerUserId: string;
  name: string;
}) {
  const id = pageChannelId(opts.pageId);
  const channel = streamServerClient.channel("messaging", id, {
    members: [opts.ownerUserId],
    created_by_id: opts.ownerUserId,
    name: opts.name,
    pageId: opts.pageId,
  });

  try {
    await channel.create();
  } catch (error) {
    const streamError = error as { code?: number; status?: number };
    if (streamError.code !== 4 && streamError.status !== 409) {
      throw error;
    }
  }

  await channel.assignRoles([
    { user_id: opts.ownerUserId, channel_role: "channel_moderator" },
  ]);

  return channel.id ?? id;
}
