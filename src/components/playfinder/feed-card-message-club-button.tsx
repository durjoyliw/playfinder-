"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useRouter } from "next/navigation";

interface FeedCardMessageClubButtonProps {
  authorId: string;
  clubName: string;
}

export function FeedCardMessageClubButton({
  authorId,
  clubName,
}: FeedCardMessageClubButtonProps) {
  const { user } = useSession();
  const router = useRouter();

  const isOwnPost = user.id === authorId;

  const handleClick = () => {
    if (isOwnPost) return;

    const draft = `Hi, I'm interested in joining ${clubName}. Can you tell me more about trials or joining?`;

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
      className="flex items-center gap-2 rounded-full bg-[#3B82F6] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#4a90f7]"
    >
      💬 Message club
    </button>
  );
}
