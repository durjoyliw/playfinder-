"use client";

import FollowButton from "@/components/FollowButton";
import { Button } from "@/components/ui/button";
import { FollowerInfo, UserData } from "@/lib/types";
import { MessageSquare, MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface ProfileActionsProps {
  user: UserData;
  followerInfo: FollowerInfo;
}

export default function ProfileActions({
  user,
  followerInfo,
}: ProfileActionsProps) {
  return (
    <div className="mx-auto flex max-w-md gap-3">
      <Button
        className="flex-1 rounded-xl bg-[#C9F31D] py-6 font-semibold text-[#0d0d0d] hover:bg-[#b8e019]"
        asChild
      >
        <Link href="/messages">
          <MessageSquare className="mr-2 h-5 w-5" />
          Message
        </Link>
      </Button>
      <FollowButton
        userId={user.id}
        initialState={followerInfo}
        variant="icon"
      />
      <Button
        variant="outline"
        size="icon"
        className="h-12 w-12 rounded-xl border-[#333] bg-[#1a1a1a] text-white hover:bg-[#262626] hover:text-[#C9F31D]"
        type="button"
        aria-label="More options"
      >
        <MoreHorizontal className="h-5 w-5" />
      </Button>
    </div>
  );
}
