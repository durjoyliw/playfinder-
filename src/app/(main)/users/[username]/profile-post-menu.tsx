"use client";

import { PostOptionsMenu } from "@/components/playfinder/post-options-menu";
import { PostData } from "@/lib/types";

interface ProfilePostMenuProps {
  post: PostData;
}

export function ProfilePostMenu({ post }: ProfilePostMenuProps) {
  return (
    <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
      <PostOptionsMenu
        post={post}
        triggerClassName="rounded-full p-1.5 text-gray-400 hover:bg-[#262626] hover:text-white"
      />
    </div>
  );
}
