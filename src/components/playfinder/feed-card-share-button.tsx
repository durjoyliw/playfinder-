"use client";

import { useToast } from "@/components/ui/use-toast";
import { cn } from "@/lib/utils";
import { Share2 } from "lucide-react";

interface FeedCardShareButtonProps {
  postId: string;
  iconOnly?: boolean;
  className?: string;
}

export function FeedCardShareButton({
  postId,
  iconOnly = false,
  className,
}: FeedCardShareButtonProps) {
  const { toast } = useToast();

  const handleShare = async () => {
    const url = `${window.location.origin}/posts/${postId}`;

    try {
      await navigator.clipboard.writeText(url);
      toast({
        description: "Link copied!",
        duration: 2000,
      });
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        description: "Failed to copy link.",
      });
    }
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className={cn(
        "flex items-center gap-1.5 text-[#888888] transition-colors hover:text-white",
        className,
      )}
      aria-label="Share post"
    >
      <Share2 className="h-5 w-5" />
      {!iconOnly && <span className="text-sm">Share</span>}
    </button>
  );
}
