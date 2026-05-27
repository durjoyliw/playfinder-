import type { Channel, FormatMessageResponse, UserResponse } from "stream-chat";
import { format, formatDistanceToNowStrict, isToday, isYesterday } from "date-fns";

export const VOLT_GREEN = "#C9F31D";

export const REACTION_EMOJIS = ["👍", "❤️", "🔥", "😂", "😮"] as const;

const LEGACY_STREAM_TYPE_TO_EMOJI: Record<string, string> = {
  like: "👍",
  love: "❤️",
  haha: "😂",
  wow: "😮",
  sad: "😢",
  angry: "😠",
};

export function emojiForReactionType(type: string): string {
  if ((REACTION_EMOJIS as readonly string[]).includes(type)) return type;
  return LEGACY_STREAM_TYPE_TO_EMOJI[type] ?? type;
}

export function streamTypeForEmoji(emoji: string): string {
  return emoji;
}

export function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function formatConversationTime(date: Date | string | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = Date.now();
  const diffMs = now - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "now";
  if (diffMins < 60) return `${diffMins}m`;
  if (diffMs < 86400000) return `${Math.floor(diffMs / 3600000)}h`;
  if (isYesterday(d)) return "Yesterday";
  if (now - d.getTime() < 7 * 86400000) {
    return format(d, "EEE");
  }
  return format(d, "d MMM");
}

export function formatMessageTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return format(d, "HH:mm");
}

export function formatDateSeparator(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  return format(d, "d MMMM");
}

export function formatLastSeen(
  lastActive: string | Date | undefined,
  online: boolean | undefined,
): string {
  if (online) return "Online";
  if (!lastActive) return "Offline";
  const d =
    typeof lastActive === "string" ? new Date(lastActive) : lastActive;
  return `Last seen ${formatDistanceToNowStrict(d, { addSuffix: true })}`;
}

export function getOtherMember(
  channel: Channel,
  currentUserId: string,
): UserResponse | undefined {
  const members = Object.values(channel.state.members ?? {});
  return members.find((m) => m.user?.id && m.user.id !== currentUserId)?.user;
}

export function channelMatchesSearch(
  channel: Channel,
  query: string,
  currentUserId: string,
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;

  const other = getOtherMember(channel, currentUserId);
  const name = (other?.name ?? other?.id ?? "").toLowerCase();
  const username = (other?.username ?? "").toLowerCase();
  const lastMessage = channel.state.messages?.at(-1);
  const preview = (
    lastMessage?.text ??
    (lastMessage?.attachments?.length ? "attachment" : "")
  ).toLowerCase();

  return name.includes(q) || username.includes(q) || preview.includes(q);
}

export function isSameDay(a: Date | string, b: Date | string): boolean {
  const da = typeof a === "string" ? new Date(a) : a;
  const db = typeof b === "string" ? new Date(b) : b;
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
}

export function isConsecutiveMessage(
  prev: FormatMessageResponse | undefined,
  curr: FormatMessageResponse,
): boolean {
  if (!prev) return false;
  return (
    prev.user?.id === curr.user?.id &&
    isSameDay(prev.created_at ?? "", curr.created_at ?? "") &&
    Math.abs(
      new Date(curr.created_at ?? 0).getTime() -
        new Date(prev.created_at ?? 0).getTime(),
    ) < 120000
  );
}

export interface PostContextData {
  label?: string;
  postId?: string;
}

export function getPostContext(channel: Channel): PostContextData | null {
  const data = channel.data as { postContext?: PostContextData } | undefined;
  return data?.postContext ?? null;
}

export interface ChannelRequestData {
  pending: boolean;
  requestedBy?: string;
  messageRequestId?: string;
  messageLocked: boolean;
  isTeammate: boolean;
}

export function getChannelRequestData(channel: Channel): ChannelRequestData {
  const data = channel.data as
    | {
        pending?: boolean;
        requestedBy?: string;
        messageRequestId?: string;
        messageLocked?: boolean;
        isTeammate?: boolean;
      }
    | undefined;

  return {
    pending: data?.pending === true,
    requestedBy: data?.requestedBy,
    messageRequestId: data?.messageRequestId,
    messageLocked: data?.messageLocked === true,
    isTeammate: data?.isTeammate === true,
  };
}
