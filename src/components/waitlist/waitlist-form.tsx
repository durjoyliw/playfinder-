"use client";

import { joinWaitlist, leaveWaitlist } from "@/app/(main)/waitlist/actions";
import LoadingButton from "@/components/LoadingButton";
import { Input } from "@/components/ui/input";
import { markWaitlistJoined } from "@/components/waitlist/waitlist-prompt-state";
import { CheckCircle2 } from "lucide-react";
import { useId, useState, useTransition } from "react";

/**
 * Email + consent + Join. Used on /waitlist and in the one-time prompt.
 * Shows a "you're on the list" state once joined, with a way to leave.
 */
export function WaitlistForm({
  initialEmail,
  source,
  onJoined,
}: {
  /** The email already on the list for this account, if any. */
  initialEmail: string | null;
  source: "page" | "prompt";
  onJoined?: () => void;
}) {
  const id = useId();
  const [joinedEmail, setJoinedEmail] = useState(initialEmail);
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string>();
  const [isPending, startTransition] = useTransition();

  if (joinedEmail) {
    return (
      <div className="pf-card rounded-xl border border-[var(--pf-c-line-2a2a2a)] bg-[var(--pf-c-fill-161616)] p-4">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--pf-volt-text)]" />
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
              You&apos;re on the list
            </p>
            <p className="mt-1 break-all text-sm text-[var(--pf-c-ink-a3a3a3)]">
              We&apos;ll email {joinedEmail} when the full version launches.
            </p>
            {source === "page" && (
              <button
                type="button"
                disabled={isPending}
                onClick={() =>
                  startTransition(async () => {
                    const result = await leaveWaitlist();
                    if (result.ok) setJoinedEmail(null);
                  })
                }
                className="mt-3 text-sm font-semibold text-[var(--pf-c-ink-a3a3a3)] underline underline-offset-4 hover:text-[var(--pf-c-ink-ffffff)] disabled:opacity-55"
              >
                Leave the waitlist
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await joinWaitlist({ email, consent, source });
      if (result.ok) {
        setJoinedEmail(result.email);
        markWaitlistJoined();
        onJoined?.();
      } else {
        setError(result.error);
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3" noValidate>
      <div>
        <label
          htmlFor={`${id}-email`}
          className="mb-1.5 block text-sm font-semibold text-[var(--pf-c-ink-ffffff)]"
        >
          Email
        </label>
        <Input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className="h-12 text-[16px]"
        />
      </div>
      <label className="flex cursor-pointer items-start gap-3 text-sm leading-snug text-[var(--pf-c-ink-a3a3a3)]">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--pf-volt)]"
        />
        <span>
          Email me when PlayFinder launches, plus the odd update before then.
          I can leave the list any time.
        </span>
      </label>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <LoadingButton
        loading={isPending}
        type="submit"
        className="h-12 w-full"
        disabled={!email.trim() || !consent}
      >
        Join the waitlist
      </LoadingButton>
    </form>
  );
}
