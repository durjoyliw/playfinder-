"use client";

import { useToast } from "@/components/ui/use-toast";
import { Share2 } from "lucide-react";

interface FeedCardShareButtonProps {
  postId: string;
}

export function FeedCardShareButton({ postId }: FeedCardShareButtonProps) {
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
      className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-white"
    >
      <Share2 className="h-4 w-4" />
      <span className="text-sm">Share</span>
    </button>
  );
}
