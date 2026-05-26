import { formatSportLabel } from "@/lib/playfinder";
import { getInitials } from "@/lib/settings";
import { PlayfinderFeedPost } from "@/lib/types";
import { MediaType } from "@prisma/client";
import { formatRelativeDate } from "@/lib/utils";

export interface HomeFeedCardProps {
  postId: string;
  authorId: string;
  username: string;
  /** Raw post intent from API (for robust LOOKING_TO_PLAY detection) */
  intent?: string;
  avatar: string;
  name: string;
  timestamp: string;
  location: string;
  sport?: string;
  content: string;
  timeLabel?: string;
  imageUrl?: string;
  likes: number;
  isLikedByUser: boolean;
  replies: number;
  showImInButton: boolean;
  isTeammate?: boolean;
  isHotTake?: boolean;
  visibility?: string;
  /** Visual-only index for avatar colour alternation */
  cardIndex?: number;
}

export function mapPostToHomeFeedCard(
  post: PlayfinderFeedPost,
  showImInButton: boolean,
): HomeFeedCardProps {
  const image = post.attachments.find((a) => a.type === MediaType.IMAGE);

  return {
    postId: post.id,
    authorId: post.user.id,
    username: post.user.username,
    intent: String(post.intent),
    avatar: post.user.avatarUrl ?? getInitials(post.user.displayName),
    name: post.user.displayName,
    timestamp: formatRelativeDate(post.createdAt),
    location: post.location ?? "Glasgow",
    sport: formatSportLabel(post.sport),
    content: post.content,
    timeLabel: post.timeLabel ?? undefined,
    imageUrl: image?.url,
    likes: post._count.likes,
    isLikedByUser: post.likes.length > 0,
    replies: post._count.comments,
    showImInButton,
    isTeammate: post.isTeammate,
    isHotTake: post.isHighlight,
    visibility: post.visibility,
  };
}
