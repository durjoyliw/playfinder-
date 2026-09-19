"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

export function PageInviteButton() {
  const { toast } = useToast();

  return (
    <Button
      type="button"
      className="h-10 flex-1 rounded-xl bg-[#a1c217] text-sm font-semibold text-[#08090a] hover:bg-[#a1c217]/90"
      onClick={() =>
        toast({ description: "Co-admin invites are coming next." })
      }
    >
      Invite a co-admin
    </Button>
  );
}

export function PageShareButton({
  handle,
  name,
}: {
  handle: string;
  name: string;
}) {
  const { toast } = useToast();

  async function share() {
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/pages/${handle}`
        : `/pages/${handle}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: name, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied" });
    } catch {
      try {
        await navigator.clipboard.writeText(url);
        toast({ description: "Link copied" });
      } catch {
        toast({
          variant: "destructive",
          description: "Could not share this page",
        });
      }
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      onClick={() => void share()}
      className="h-10 flex-1 rounded-xl border-[#2a2f2a] bg-[#131614] text-sm font-semibold text-[#f2f5ef] hover:bg-[#1a1e1b] hover:text-[#f2f5ef]"
    >
      Share
    </Button>
  );
}
