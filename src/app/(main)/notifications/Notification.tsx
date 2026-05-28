import UserAvatar from "@/components/UserAvatar";
import { NotificationData } from "@/lib/types";
import { cn } from "@/lib/utils";
import { NotificationType } from "@prisma/client";
import { Heart, MessageCircle, User2 } from "lucide-react";
import Link from "next/link";

interface NotificationProps {
  notification: NotificationData;
}

export default function Notification({ notification }: NotificationProps) {
  const notificationTypeMap: Record<
    Exclude<NotificationType, "GAME_INTEREST">,
    { message: string; icon: JSX.Element; href: string }
  > = {
    FOLLOW: {
      message: `${notification.issuer.displayName} followed you`,
      icon: <User2 className="size-7 text-primary" />,
      href: `/users/${notification.issuer.username}`,
    },
    TEAMMATE: {
      message: `You and ${notification.issuer.displayName} are now Teammates ⚡`,
      icon: <User2 className="size-7 text-[#C9F31D]" />,
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
              ? `${notification.issuer.displayName} is interested in your game`
              : `${notification.issuer.displayName} accepted you for the game`,
          icon: <MessageCircle className="size-7 text-[#C9F31D]" />,
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
