"use client";

import { openCookieSettings } from "@/lib/consent";

/** Reopens the cookie consent banner from the Cookie Policy page. */
export function CookieSettingsButton() {
  return (
    <button
      type="button"
      onClick={openCookieSettings}
      className="min-h-11 rounded-xl border border-[var(--pf-border-light)] bg-[var(--pf-surface-2)] px-4 text-sm font-semibold text-[var(--pf-text)] outline-none transition-[background-color,transform] duration-150 hover:bg-[var(--pf-surface-3)] active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]"
    >
      Change cookie settings
    </button>
  );
}
