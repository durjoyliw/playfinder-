"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/components/ui/use-toast";
import kyInstance from "@/lib/ky";
import {
  getProfileIntentDisplay,
  PROFILE_INTENT_PROFILE_OPTIONS,
} from "@/lib/settings";
import type { UserSettingsData } from "@/lib/settings";
import { ProfileIntent } from "@prisma/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
  const [intent, setIntent] = useState(profileIntent ?? ProfileIntent.LOOKING_TO_PLAY);
  const display = getProfileIntentDisplay(intent);

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
      toast({ description: "Intent updated" });
    },
    onError: () => {
      toast({
        variant: "destructive",
        description: "Failed to update intent. Please try again.",
      });
    },
  });

  const pillContent = (
    <>
      <span className={`h-2 w-2 rounded-full ${display.dotClassName}`} />
      <span className="max-w-[220px] truncate">{display.label}</span>
      {isOwnProfile && <ChevronDown className="h-4 w-4 flex-shrink-0" />}
    </>
  );

  if (!isOwnProfile) {
    return (
      <div
        className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium ${display.pillClassName}`}
      >
        {pillContent}
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={`mt-4 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${display.pillClassName}`}
        >
          {pillContent}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="w-72 border-[#262626] bg-[#161616] p-1"
      >
        {PROFILE_INTENT_PROFILE_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.value}
            className="cursor-pointer rounded-lg px-3 py-2.5 text-white focus:bg-[#1f1f1f] focus:text-white"
            onClick={() => mutation.mutate(option.value)}
            disabled={mutation.isPending}
          >
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">
                {option.emoji} {option.label}
              </span>
              <span className="text-xs text-muted-foreground">
                {option.description}
              </span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
