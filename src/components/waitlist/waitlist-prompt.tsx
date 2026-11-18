"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from "@/components/ui/dialog";
import { WaitlistForm } from "@/components/waitlist/waitlist-form";
import {
  markWaitlistPromptDismissed,
  shouldShowWaitlistPrompt,
} from "@/components/waitlist/waitlist-prompt-state";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Screens where a pop-up would get in the way. */
const QUIET_PATHS = [/^\/waitlist/, /^\/settings/, /^\/messages\/./, /^\/onboarding/];

/**
 * Asks once, on a later day than someone's first visit, whether they want
 * the launch email. Never on day one, never again once answered.
 */
export function WaitlistPrompt({ onWaitlist }: { onWaitlist: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (onWaitlist) return;
    if (QUIET_PATHS.some((re) => re.test(pathname))) return;
    if (!shouldShowWaitlistPrompt()) return;
    // Let the page settle first; don't pop up the moment it loads.
    const timer = setTimeout(() => setOpen(true), 6000);
    return () => clearTimeout(timer);
    // Only decide once per page load.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function close() {
    if (!joined) markWaitlistPromptDismissed();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && close()}>
      <DialogContent className="gap-0 border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-161616)] p-5 text-[var(--pf-c-ink-ffffff)] max-sm:bottom-0 max-sm:top-auto max-sm:max-w-none max-sm:translate-y-0 max-sm:rounded-b-none max-sm:rounded-t-[24px] max-sm:pb-[calc(20px+env(safe-area-inset-bottom,0px))] sm:max-w-md sm:rounded-2xl">
        <DialogTitle className="pr-8 text-[20px] font-bold tracking-[-0.02em]">
          {joined ? "Thanks for joining" : "Want the launch email?"}
        </DialogTitle>
        <DialogDescription className="mt-1.5 text-[14px] leading-relaxed text-[var(--pf-c-ink-a3a3a3)]">
          {joined
            ? "We'll be in touch when the full version is ready."
            : "PlayFinder is still in beta. Join the waitlist and we'll email you when the full version launches, with groups, hashtags and photos."}
        </DialogDescription>
        <div className="mt-4">
          <WaitlistForm
            initialEmail={null}
            source="prompt"
            onJoined={() => setJoined(true)}
          />
        </div>
        <button
          type="button"
          onClick={close}
          className="mt-3 h-11 w-full rounded-xl text-sm font-semibold text-[var(--pf-c-ink-a3a3a3)] hover:text-[var(--pf-c-ink-ffffff)]"
        >
          {joined ? "Done" : "Not now"}
        </button>
      </DialogContent>
    </Dialog>
  );
}
