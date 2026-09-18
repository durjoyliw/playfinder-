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
    <div className="mt-7 px-4">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="mb-1 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
            In my own words
          </p>
          <h2 className="text-[22px] font-bold tracking-[-0.03em] text-[#f2f5ef]">
            Athlete Story
          </h2>
        </div>
        {isOwnProfile && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-[#2a2f2a] bg-[#131614] text-[#7e8a7e]"
            aria-label="Edit athlete story"
          >
            <Pencil className="h-[17px] w-[17px]" />
          </button>
        )}
      </div>

      <div className="relative overflow-hidden rounded-[18px] border border-[#2a2f2a] bg-[#131614] p-[22px]">
        <div
          className="pointer-events-none absolute right-4 top-2 font-serif text-[52px] leading-none text-[#a1c217] opacity-10"
          aria-hidden
        >
          "
        </div>
        {isEditing ? (
          <div className="relative z-[1] space-y-3">
            <textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              rows={5}
              className="w-full resize-none rounded-[14px] border border-[#2a2f2a] bg-[#0d0f0d] px-3 py-2.5 text-[15px] leading-relaxed text-[#f2f5ef] outline-none focus:border-[#a1c217]"
              placeholder="Tell others about your sports background..."
              autoFocus
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => mutation.mutate(draft.trim())}
                disabled={mutation.isPending}
                className="rounded-xl bg-[#a1c217] px-4 py-2 text-sm font-semibold text-[#0a0b0a] disabled:opacity-60"
              >
                {mutation.isPending ? "Saving..." : "Save"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setDraft(bio ?? "");
                  setIsEditing(false);
                }}
                className="rounded-xl px-4 py-2 text-sm text-[#7e8a7e]"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="relative z-[1] text-[15px] leading-relaxed text-[#b4bcaf]">
              {bio?.trim() || placeholder}
            </p>
            {bio?.trim() && (
              <p className="relative z-[1] mt-3.5 font-dm-mono text-[10px] text-[#5a635a]">
                Last updated recently
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
