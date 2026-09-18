import type { PrismaClient } from "@prisma/client";
import webpush from "web-push";

// Public key uses the NEXT_PUBLIC_ prefix so the same value the client
// subscribes with (see the notifications settings page) is also what the
// server signs with -- one key pair, no risk of the two drifting apart.
const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;
const subject = process.env.VAPID_SUBJECT || "mailto:support@playfinder.app";

let configured = false;
if (publicKey && privateKey) {
  webpush.setVapidDetails(subject, publicKey, privateKey);
  configured = true;
} else {
  console.warn(
    "Web push is not configured: set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY " +
      "to enable real device push notifications (in-app notifications still work).",
  );
}

export function isPushConfigured(): boolean {
  return configured;
}

export interface PushPayload {
  title: string;
  body: string;
  url?: string;
}

/**
 * Sends a web push notification to every subscription a user has
 * registered (they may have more than one, e.g. two browsers). Silently
 * no-ops if push isn't configured, and prunes subscriptions the push
 * service reports as gone (410/404) instead of retrying them forever.
 */
export async function sendPushToUser(
  prismaClient: PrismaClient,
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!configured) return;

  const subscriptions = await prismaClient.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) return;

  await Promise.all(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          JSON.stringify(payload),
        );
      } catch (error) {
        const statusCode = (error as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          await prismaClient.pushSubscription
            .delete({ where: { id: sub.id } })
            .catch(() => {});
        } else {
          console.error("Push notification send failed", error);
        }
      }
    }),
  );
}
