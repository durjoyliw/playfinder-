"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";

interface FeedCardImInButtonProps {
  authorId: string;
  sport?: string;
  location?: string;
  timeLabel?: string;
}

export function FeedCardImInButton({
  authorId,
  sport,
  location,
  timeLabel,
}: FeedCardImInButtonProps) {
  const { user } = useSession();
  const router = useRouter();

  const isOwnPost = user.id === authorId;

  const handleClick = () => {
    if (isOwnPost) return;

    const sportLabel = sport ?? "game";
    const locationLabel = location ?? "your location";
    const time = timeLabel ?? "soon";

    const draft = `Hey! I'm in for your ${sportLabel} game at ${locationLabel} - ${time}. Looking forward to it!`;

    router.push(
      `/messages?to=${encodeURIComponent(authorId)}&draft=${encodeURIComponent(draft)}`,
    );
  };

  if (isOwnPost) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex items-center gap-2 rounded-full bg-[#C9F31D] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a]"
    >
      👋 I&apos;m in
    </button>
  );
}
