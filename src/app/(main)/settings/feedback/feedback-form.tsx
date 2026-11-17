"use client";

import LoadingButton from "@/components/LoadingButton";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { submitFeedback } from "./actions";

const PROMPTS = [
  "Something broke or looked wrong",
  "Something was confusing",
  "An idea or a missing feature",
];

export function FeedbackForm() {
  const searchParams = useSearchParams();
  const from = searchParams.get("from") ?? undefined;
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string>();
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(undefined);
    startTransition(async () => {
      const result = await submitFeedback({ message, page: from });
      if (result.ok) {
        setSent(true);
        setMessage("");
      } else {
        setError(result.error);
      }
    });
  }

  if (sent) {
    return (
      <div className="rounded-xl bg-[var(--pf-c-fill-161616)] p-5 pf-card">
        <div className="flex items-start gap-3">
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-[var(--pf-volt-text)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--pf-c-ink-ffffff)]">
              Thanks — got it
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              Every message gets read. Feedback like this is what shapes
              PlayFinder during the beta.
            </p>
            <div className="mt-3 flex gap-4 text-sm font-semibold">
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-[var(--pf-volt-text)]"
              >
                Send more
              </button>
              <Link href={from ?? "/home"} className="text-muted-foreground">
                Back
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm leading-relaxed text-muted-foreground">
        You&apos;re testing an early version of PlayFinder. Tell us what
        broke, what confused you, or what you wish it did — it goes straight
        to the person building it.
      </p>
      <div className="flex flex-wrap gap-2">
        {PROMPTS.map((prompt) => (
          <button
            key={prompt}
            type="button"
            onClick={() =>
              setMessage((current) =>
                current.trim() ? current : `${prompt}: `,
              )
            }
            className="rounded-full border border-[var(--pf-c-line-2a2a2a)] px-3 py-1.5 text-xs text-[var(--pf-c-ink-a3a3a3)] transition-colors hover:text-[var(--pf-c-ink-ffffff)]"
          >
            {prompt}
          </button>
        ))}
      </div>
      <Textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="What happened? What did you expect?"
        rows={6}
        maxLength={2000}
        aria-label="Your feedback"
      />
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      <LoadingButton
        loading={isPending}
        type="submit"
        className="w-full"
        disabled={message.trim().length < 3}
      >
        Send feedback
      </LoadingButton>
      {from && (
        <p className="text-center text-xs text-muted-foreground">
          We&apos;ll note you were on <span className="font-mono">{from}</span>.
        </p>
      )}
    </form>
  );
}
