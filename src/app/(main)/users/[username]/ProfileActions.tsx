"use client";

import { Button } from "@/components/ui/button";
import { FollowerInfo, UserData } from "@/lib/types";
import FollowButton from "@/components/FollowButton";
import { IconMessageCircle2 } from "@tabler/icons-react";
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
    <div className="flex w-full gap-2">
      <Button
        className="flex-1 rounded-xl border border-[#2a2a2a] bg-[#161616] py-6 font-semibold text-[#f0f0f0] hover:bg-[#1f1f1f]"
        asChild
      >
        <Link href="/messages">
          <IconMessageCircle2 className="mr-2 h-5 w-5" />
          Message
        </Link>
      </Button>
      <FollowButton
        userId={user.id}
        initialState={followerInfo}
        className="flex-1 py-6"
      />
    </div>
  );
}
