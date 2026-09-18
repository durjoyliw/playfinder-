"use client";

import { submitAppeal } from "@/lib/appeals";
import { format } from "date-fns";
import { useState } from "react";

export function RestrictedAccountView({
  status,
  suspendedUntil,
  hasPendingAppeal,
}: {
  status: "SUSPENDED" | "BANNED";
  suspendedUntil: string | null;
  hasPendingAppeal: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [submitted, setSubmitted] = useState(hasPendingAppeal);

  async function handleSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await submitAppeal(formData);
    if (result?.error) {
      setError(result.error);
      setPending(false);
      return;
    }
    setSubmitted(true);
    setPending(false);
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#08090a] px-4 text-[#f2f5ef]">
      <div className="w-full max-w-md space-y-5 rounded-xl border border-[#2a2f2a] bg-[#121412] p-8">
        <h1 className="text-xl font-semibold">
          Account {status === "BANNED" ? "banned" : "suspended"}
        </h1>
        <p className="text-sm text-[#8a8f86]">
          {status === "BANNED"
            ? "Your account has been permanently banned."
            : suspendedUntil
              ? `Your account is suspended until ${format(new Date(suspendedUntil), "d MMM yyyy HH:mm")}.`
              : "Your account is currently suspended."}
        </p>

        {submitted ? (
          <p className="rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 py-2 text-sm text-[#c4c9bf]">
            Your appeal is being reviewed. You can only have one pending appeal
            at a time.
          </p>
        ) : (
          <form action={handleSubmit} className="space-y-4">
            {error && (
              <p className="rounded-md border border-red-900/60 bg-red-950/40 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            <label className="block space-y-1.5 text-sm">
              <span>Why should your account be reinstated?</span>
              <textarea
                name="reason"
                required
                rows={5}
                className="w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 py-2 text-sm outline-none focus:border-[#dcef5a]"
              />
            </label>
            <button
              type="submit"
              disabled={pending}
              className="h-10 w-full rounded-md bg-[#dcef5a] text-sm font-semibold text-[#08090a] disabled:opacity-60"
            >
              {pending ? "Submitting…" : "Submit appeal"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
