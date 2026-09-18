"use client";

import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import {
  getProfileIntentDisplay,
  PROFILE_INTENT_PROFILE_OPTIONS,
} from "@/lib/settings";
import type { UserSettingsData } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { ProfileIntent } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const INTENT_COLOURS: Record<ProfileIntent, string> = {
  [ProfileIntent.LOOKING_TO_PLAY]: "#a1c217",
  [ProfileIntent.JOIN_A_TEAM]: "#56ccf2",
  [ProfileIntent.JUST_VIBES]: "#eab308",
};

interface ProfileIntentPillProps {
  profileIntent: ProfileIntent | null;
  isOwnProfile: boolean;
}

export default function ProfileIntentPill({
  profileIntent,
  isOwnProfile,
}: ProfileIntentPillProps) {
  const { toast } = useToast();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [intent, setIntent] = useState(
    profileIntent ?? ProfileIntent.LOOKING_TO_PLAY,
  );

  const mutation = useMutation({
    mutationFn: (intentTag: ProfileIntent) =>
      kyInstance
        .patch("/api/users/profile", { json: { intentTag } })
        .json<UserSettingsData>(),
    onSuccess: (data) => {
      const next = data.profileIntent ?? ProfileIntent.LOOKING_TO_PLAY;
      setIntent(next);
      queryClient.invalidateQueries({ queryKey: ["user-settings"] });
      router.refresh();
      toast({ description: "Status updated" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to update status. Please try again.",
      });
    },
  });

  return (
    <div className="mt-5">
      <p className="mb-2.5 font-dm-mono text-[11px] font-medium uppercase tracking-[0.14em] text-[#7e8a7e]">
        Current status
      </p>
      {isOwnProfile ? (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PROFILE_INTENT_PROFILE_OPTIONS.map((option) => {
            const colour = INTENT_COLOURS[option.value];
            const selected = intent === option.value;
            return (
              <button
                key={option.value}
                type="button"
                disabled={mutation.isPending}
                onClick={() => mutation.mutate(option.value)}
                className={cn(
                  "flex min-h-11 shrink-0 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold whitespace-nowrap transition-all active:scale-95",
                  selected
                    ? "text-[#f2f5ef]"
                    : "border-[#2a2f2a] bg-[#131614] text-[#b4bcaf]",
                )}
                style={
                  selected
                    ? {
                        borderColor: colour,
                        background: `color-mix(in srgb, ${colour} 8%, #131614)`,
                      }
                    : undefined
                }
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: colour }}
                />
                {option.label}
              </button>
            );
          })}
        </div>
      ) : (
        <div
          className="inline-flex min-h-11 items-center gap-1.5 rounded-xl border px-3.5 py-2.5 text-[13px] font-semibold text-[#f2f5ef]"
          style={{
            borderColor: `${INTENT_COLOURS[intent]}44`,
            background: `color-mix(in srgb, ${INTENT_COLOURS[intent]} 8%, #131614)`,
          }}
        >
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: INTENT_COLOURS[intent] }}
          />
          {getProfileIntentDisplay(intent).label}
        </div>
      )}
    </div>
  );
}
