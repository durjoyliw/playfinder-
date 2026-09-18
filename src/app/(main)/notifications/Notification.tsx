import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import {
  Bell,
  Calendar,
  Flame,
  Heart,
  MessageCircle,
  User2,
} from "lucide-react";
import Link from "next/link";

interface NotificationProps {
  notification: NotificationData;
}

const SYSTEM_TYPES: readonly NotificationType[] = [
  "NEARBY_GAMES",
  "INACTIVITY_NUDGE",
  "TRENDING_POST",
];

export default function Notification({ notification }: NotificationProps) {
  // System-generated notifications (nearby games, inactivity nudges,
  // trending) have no issuer -- they render from `body` with a generic
  // icon instead of a person's avatar and name.
  if (SYSTEM_TYPES.includes(notification.type)) {
    const systemIconMap: Record<string, JSX.Element> = {
      NEARBY_GAMES: <Calendar className="size-7 text-[#A1C217]" />,
      INACTIVITY_NUDGE: <Bell className="size-7 text-[#A1C217]" />,
      TRENDING_POST: <Flame className="size-7 text-[#EF9F27]" />,
    };
    const href =
      notification.type === "TRENDING_POST"
        ? "/discover"
        : notification.type === "NEARBY_GAMES"
          ? "/discover"
          : "/home";

    return (
      <Link href={href} className="block">
        <article
          className={cn(
            "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
            !notification.read && "bg-primary/10",
          )}
        >
          <div className="my-1">{systemIconMap[notification.type]}</div>
          <div className="space-y-1">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-[#A1C217]/15 text-xs font-bold text-[#A1C217]">
              PF
            </div>
            <div>{notification.body ?? "You have a new notification"}</div>
          </div>
        </article>
      </Link>
    );
  }

  if (!notification.issuer) {
    return null;
  }

  const notificationTypeMap: Partial<
    Record<
      NotificationType,
      { message: string; icon: JSX.Element; href: string }
    >
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notification.issuer.username}`,
    },
    TEAMMATE: {
      message: `You and ${notification.issuer.displayName} are now Teammates ⚡`,
      icon: <User2 className="size-7 text-[#A1C217]" />,
      href: `/users/${notification.issuer.username}`,
    },
    COMMENT: {
      message: `${notification.issuer.displayName} commented on your post`,
      icon: <MessageCircle className="size-7 fill-primary text-primary" />,
      href: `/posts/${notification.postId}`,
    },
    LIKE: {
      message: `${notification.issuer.displayName} liked your post`,
      icon: <Heart className="size-7 fill-red-500 text-red-500" />,
      href: `/posts/${notification.postId}`,
    },
    MESSAGE_REQUEST: {
      message: `${notification.issuer.displayName} sent you a message request`,
      icon: <MessageCircle className="size-7 text-primary" />,
      href: `/messages`,
    },
  };

  const entry =
    notification.type === "GAME_INTEREST"
      ? {
          message:
            notification.post?.userId === notification.recipientId
              ? `${notification.issuer.displayName} is interested in joining your game`
              : `${notification.issuer.displayName} accepted you for the game`,
          icon: <MessageCircle className="size-7 text-[#A1C217]" />,
          href: notification.postId ? `/posts/${notification.postId}` : "/",
        }
      : notificationTypeMap[notification.type];
  if (!entry) {
    return null;
  }

  const { message, icon, href } = entry;

  return (
    <Link href={href} className="block">
      <article
        className={cn(
          "flex gap-3 rounded-2xl bg-card p-5 shadow-sm transition-colors hover:bg-card/70",
          !notification.read && "bg-primary/10",
        )}
      >
        <div className="my-1">{icon}</div>
        <div className="space-y-3">
          <UserAvatar avatarUrl={notification.issuer.avatarUrl} size={36} />
          <div>{message}</div>
          {notification.post && (
            <div className="line-clamp-3 whitespace-pre-line text-muted-foreground">
              {notification.post.content}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
