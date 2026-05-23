"use client";

import DeletePostDialog from "@/components/posts/DeletePostDialog";
import { useToast } from "@/components/ui/use-toast";
import { EditPostSheet } from "@/components/playfinder/edit-post-sheet";
import kyInstance from "@/lib/ky";
import { PostData } from "@/lib/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Share2, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface PostOptionsMenuProps {
  post: PostData;
  /** Redirect to feed after delete when on single post page */
  redirectToFeedOnDelete?: boolean;
  triggerClassName?: string;
}

export function PostOptionsMenu({
  post,
  redirectToFeedOnDelete = false,
  triggerClassName = "rounded-full p-2 text-gray-400 hover:bg-[#262626] hover:text-white",
}: PostOptionsMenuProps) {
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [showDelete, setShowDelete] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const highlightMutation = useMutation({
    mutationFn: () =>
      kyInstance.patch(`/api/posts/${post.id}/highlight`).json<PostData>(),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["post-feed"] });
      queryClient.invalidateQueries({ queryKey: ["post", post.id] });
      toast({
        description: updated.isHighlight
          ? "Added to highlights"
          : "Removed from highlights",
      });
      setOpen(false);
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Could not update highlight.",
      });
    },
  });

  const share = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast({ description: "Link copied!" });
    } catch {
      toast({
        variant: "destructive",
        description: "Could not copy link.",
      });
    }
    setOpen(false);
  };

  const menuItemClass =
    "flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-white hover:bg-[#262626] first:rounded-t-xl last:rounded-b-xl";

  return (
    <>
      <div ref={menuRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={triggerClassName}
          aria-label="Post options"
          aria-expanded={open}
          aria-haspopup="menu"
        >
          <MoreVertical className="h-5 w-5" />
        </button>

        {open && (
          <div
            role="menu"
            className="absolute right-0 top-10 z-50 w-[180px] overflow-hidden rounded-xl border border-[#333] bg-[#1a1a1a] py-1 shadow-lg"
          >
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => {
                setOpen(false);
                setEditOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 shrink-0 text-gray-400" />
              Edit
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={() => highlightMutation.mutate()}
              disabled={highlightMutation.isPending}
            >
              <Star className="h-4 w-4 shrink-0 text-gray-400" />
              {post.isHighlight
                ? "Remove from Highlights"
                : "Add to Highlights"}
            </button>
            <button
              type="button"
              role="menuitem"
              className={menuItemClass}
              onClick={share}
            >
              <Share2 className="h-4 w-4 shrink-0 text-gray-400" />
              Share
            </button>
            <button
              type="button"
              role="menuitem"
              className={`${menuItemClass} text-red-400 hover:bg-[#262626]`}
              onClick={() => {
                setOpen(false);
                setShowDelete(true);
              }}
            >
              <Trash2 className="h-4 w-4 shrink-0" />
              Delete
            </button>
          </div>
        )}
      </div>

      <EditPostSheet post={post} open={editOpen} onOpenChange={setEditOpen} />

      <DeletePostDialog
        post={post}
        open={showDelete}
        onClose={() => setShowDelete(false)}
        onDeleted={() => {
          if (redirectToFeedOnDelete) router.push("/");
        }}
      />
    </>
  );
}
