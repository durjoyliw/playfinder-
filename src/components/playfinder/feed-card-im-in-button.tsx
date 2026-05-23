"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";

interface FeedCardImInButtonProps {
  authorId: string;
  sport?: string;
  location?: string;
  timeLabel?: string;
  fullWidth?: boolean;
}

export function FeedCardImInButton({
  authorId,
  sport,
  fullWidth = false,
}: FeedCardImInButtonProps) {
  const { user } = useSession();
  const router = useRouter();

  const isOwnPost = user.id === authorId;

  const handleClick = () => {
    if (isOwnPost) return;

    const sportLabel = sport ?? "your game";

    const draft = `I'm in! 👋 Saw your post about ${sportLabel} — still need players?`;

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
      className={
        fullWidth
          ? "flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9F31D] px-4 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#d4f73a]"
          : "flex w-full items-center justify-center gap-2 rounded-xl bg-[#C9F31D] py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#d4f73a]"
      }
    >
      I&apos;m in 👋
    </button>
  );
}
