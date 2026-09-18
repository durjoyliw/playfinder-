import type {
  Notification,
  NotificationType,
  PrismaClient,
} from "@prisma/client";
import { sendPushToUser } from "@/lib/push";

const STATIC_MESSAGES: Partial<Record<NotificationType, { title: string }>> = {
  MESSAGE_REQUEST: { title: "New message request" },
  GAME_INTEREST: { title: "Game interest" },
  NEARBY_GAMES: { title: "Games near you" },
  INACTIVITY_NUDGE: { title: "We miss you" },
  TRENDING_POST: { title: "Trending now" },
};

/**
 * Turns a just-created Notification row into a push payload and sends it.
 * Called from the prisma `notification.create` extension, so every
 * notification type -- event-driven (like/comment/follow/...) and the
 * system-generated ones (nearby games, inactivity, trending) -- gets a
 * real device push for free, without touching each call site.
 */
export async function sendPushForNotification(
  prismaClient: PrismaClient,
  notification: Notification,
): Promise<void> {
  const issuer = notification.issuerId
    ? await prismaClient.user.findUnique({
        where: { id: notification.issuerId },
        select: { displayName: true },
      })
    : null;
  const name = issuer?.displayName ?? "Someone";

  const bodyByType: Record<NotificationType, string> = {
    LIKE: `${name} liked your post`,
    FOLLOW: `${name} wants to be teammates`,
    COMMENT: `${name} commented on your post`,
    TEAMMATE: `You and ${name} are now teammates`,
    MESSAGE_REQUEST: `${name} sent you a message request`,
    GAME_INTEREST: `${name} is interested in your game`,
    NEARBY_GAMES: notification.body ?? "New games near you this weekend",
    INACTIVITY_NUDGE:
      notification.body ?? "It's been a while -- share what you're up to",
    TRENDING_POST: notification.body ?? "A post in your sport is trending",
  };

  const title = STATIC_MESSAGES[notification.type]?.title ?? "PlayFinder";
  const body = bodyByType[notification.type] ?? "You have a new notification";
  const url = notification.postId
    ? `/posts/${notification.postId}`
    : "/notifications";

  await sendPushToUser(prismaClient, notification.recipientId, {
    title,
    body,
    url,
  });
}
