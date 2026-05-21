"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import type { UserSettingsData } from "@/lib/settings";
import { useMutation } from "@tanstack/react-query";
import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface ProfileBioEditorProps {
  bio: string | null;
  isOwnProfile: boolean;
}

export default function ProfileBioEditor({
  bio,
  isOwnProfile,
}: ProfileBioEditorProps) {
  const { toast } = useToast();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(bio ?? "");

  useEffect(() => {
    setDraft(bio ?? "");
  }, [bio]);

  const mutation = useMutation({
    mutationFn: (nextBio: string) =>
      kyInstance
        .patch("/api/users/profile", { json: { bio: nextBio } })
        .json<UserSettingsData>(),
    onSuccess: (data) => {
      setDraft(data.bio ?? "");
      setIsEditing(false);
      router.refresh();
      toast({ description: "Bio saved successfully" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to save bio. Please try again.",
      });
    },
  });

  const placeholder =
    "No athlete story yet. Add a bio to tell others about your sports background.";

  return (
    <div className="mx-4 mt-6">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Athlete Story
        </h2>
        {isOwnProfile && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="rounded-full p-1.5 text-[#C9F31D] transition-colors hover:bg-[#C9F31D]/10"
            aria-label="Edit athlete story"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="rounded-xl border border-[#262626] bg-[#1a1a1a] p-4">
        {isEditing ? (
          <div className="space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-lg border border-[#2a2a2a] bg-[#0d0d0d] px-3 py-2.5 text-sm leading-relaxed text-white focus:border-[#C9F31D] focus:outline-none"
              placeholder="Tell others about your sports background..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mutation.mutate(draft.trim())}
                disabled={mutation.isPending}
                className="rounded-lg bg-[#C9F31D] px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-[#d4f73a] disabled:opacity-60"
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(bio ?? "");
                  setIsEditing(false);
                }}
                className="rounded-lg px-4 py-2 text-sm text-muted-foreground transition-colors hover:text-white"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-gray-300">
            {bio?.trim() || placeholder}
          </p>
        )}
      </div>
    </div>
  );
}
