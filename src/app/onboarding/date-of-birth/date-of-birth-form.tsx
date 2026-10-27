"use client";

import { MINIMUM_AGE, todayIsoDate } from "@/lib/age";
import { Loader2 } from "lucide-react";
import { useState, useTransition } from "react";
import { confirmBirthDate } from "./actions";

export function DateOfBirthForm() {
  const [value, setValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value || isPending) return;
    setError(null);
    startTransition(async () => {
      // The action redirects on success (rest of onboarding) and for
      // under-18s (/age-restricted); it only returns for a bad date.
      const result = await confirmBirthDate(value);
      if (result?.message) setError(result.message);
    });
  };

  return (
    <form onSubmit={submit}>
      <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
        One quick thing
      </p>
      <h1 className="mt-2 text-[26px] font-bold leading-tight tracking-[-0.03em] text-[var(--pf-text)]">
        Confirm your date of birth
      </h1>
      <p className="mt-2 text-[15px] leading-relaxed text-[var(--pf-text-2)]">
        PlayFinder is for people aged {MINIMUM_AGE} and over. We don’t show
        your birthday on your profile.
      </p>

      <label className="mt-8 block">
        <span className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.12em] text-[var(--pf-text-3)]">
          Date of birth
        </span>
        <input
          type="date"
          required
          autoComplete="bday"
          min="1900-01-01"
          max={todayIsoDate()}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          aria-invalid={!!error}
          aria-describedby={error ? "dob-error" : undefined}
          className="mt-2 h-12 w-full rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] px-4 text-base text-[var(--pf-text)] outline-none transition-colors focus:border-[var(--pf-volt)] lg:text-[15px]"
        />
      </label>

      {error && (
        <p id="dob-error" role="alert" className="mt-2 text-[13px] font-medium text-[#ef4444]">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!value || isPending}
        className="mt-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--pf-volt)] text-[15px] font-bold text-[var(--pf-on-accent)] transition-[filter,transform,opacity] hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
      >
        {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
        Continue
      </button>
    </form>
  );
}
