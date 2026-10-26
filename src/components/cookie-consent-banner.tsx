"use client";

import {
  CONSENT_CHANGE_EVENT,
  OPEN_CONSENT_EVENT,
  getConsent,
  setConsent,
  type ConsentChoice,
} from "@/lib/consent";
import Link from "next/link";
import { useEffect, useState } from "react";

/**
 * First-visit cookie consent, shown on every route (mounted in the root
 * layout). Reopened from Settings -> Legal or /cookies via
 * `openCookieSettings()`.
 *
 * Positioning lives in globals.css (`.pf-consent`): it sits above the bottom
 * nav and its raised "+" when that nav is on screen, and clear of the notch /
 * home indicator everywhere.
 */
export function CookieConsentBanner() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ConsentChoice | null>(null);

  useEffect(() => {
    const saved = getConsent();
    setCurrent(saved);
    if (!saved) setOpen(true);

    const reopen = () => {
      setCurrent(getConsent());
      setOpen(true);
    };
    window.addEventListener(OPEN_CONSENT_EVENT, reopen);
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, reopen);
  }, []);

  useEffect(() => {
    const onChange = (e: Event) =>
      setCurrent((e as CustomEvent<ConsentChoice>).detail);
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  if (!open) return null;

  const choose = (choice: ConsentChoice) => {
    setConsent(choice);
    setOpen(false);
  };

  // Accept and Reject are deliberately identical in size and style: the ICO
  // expects rejecting to be as easy as accepting.
  const buttonClass =
    "min-h-11 flex-1 rounded-xl border border-[var(--pf-border-light)] bg-[var(--pf-surface-2)] px-4 text-sm font-semibold text-[var(--pf-text)] outline-none transition-[background-color,transform] duration-150 hover:bg-[var(--pf-surface-3)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]";

  return (
    <section
      role="region"
      aria-label="Cookie consent"
      className="pf-consent fixed z-[var(--pf-z-banner)] mx-auto max-w-[456px] rounded-2xl border border-[var(--pf-border)] bg-[rgba(19,22,20,0.97)] p-4 font-grotesk text-[var(--pf-text)] shadow-[0_12px_40px_rgba(0,0,0,0.55)] backdrop-blur-[20px] duration-300 animate-in fade-in-0 slide-in-from-bottom-4 motion-reduce:animate-none"
    >
      <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
        Cookies
      </p>
      <p className="mt-1.5 text-[13px] leading-relaxed text-[var(--pf-text-2)]">
        We use essential cookies to keep you logged in and the app secure.
        With your OK, we’d also use analytics cookies to see how PlayFinder is
        used so we can improve it. See our{" "}
        <Link
          href="/cookies"
          className="text-[var(--pf-text)] underline underline-offset-2"
        >
          Cookie Policy
        </Link>{" "}
        and{" "}
        <Link
          href="/privacy"
          className="text-[var(--pf-text)] underline underline-offset-2"
        >
          Privacy Policy
        </Link>
        .
      </p>
      {current && (
        <p className="mt-2 text-xs text-[var(--pf-text-3)]">
          Current choice:{" "}
          <span className="font-semibold text-[var(--pf-text-2)]">
            {current === "accepted" ? "analytics allowed" : "essential only"}
          </span>
        </p>
      )}
      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          className={buttonClass}
          onClick={() => choose("rejected")}
        >
          Reject
        </button>
        <button
          type="button"
          className={buttonClass}
          onClick={() => choose("accepted")}
        >
          Accept
        </button>
      </div>
    </section>
  );
}
