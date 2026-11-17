/**
 * Cookie consent (UK PECR / UK GDPR).
 *
 * The choice lives in a first-party cookie -- itself an essential cookie, as
 * the Cookie Policy says. The value is versioned (`v1:accepted`) so a future
 * policy change can bump CONSENT_VERSION and ask everyone again.
 *
 * Analytics is not wired yet. When it is, it must check
 * `hasAnalyticsConsent()` before loading anything, and can listen for
 * CONSENT_CHANGE_EVENT to start (or stop) when the choice changes.
 */

export type ConsentChoice = "accepted" | "rejected";

export const CONSENT_COOKIE = "pf_cookie_consent";
const CONSENT_VERSION = "v1";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/** Fired on window after the choice is saved. `detail` is the new choice. */
export const CONSENT_CHANGE_EVENT = "pf:consent-change";
/** Fired on window to reopen the consent banner (e.g. "Cookie settings"). */
export const OPEN_CONSENT_EVENT = "pf:open-cookie-settings";

/** Parses a raw cookie value; anything unknown or outdated counts as no choice. */
export function parseConsent(raw: string | undefined | null): ConsentChoice | null {
  if (!raw) return null;
  const [version, choice] = decodeURIComponent(raw).split(":");
  if (version !== CONSENT_VERSION) return null;
  return choice === "accepted" || choice === "rejected" ? choice : null;
}

/** The saved choice, or null if the user hasn't chosen yet. Client-only. */
export function getConsent(): ConsentChoice | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie
    .split("; ")
    .find((part) => part.startsWith(`${CONSENT_COOKIE}=`));
  return parseConsent(match?.slice(CONSENT_COOKIE.length + 1));
}

export function setConsent(choice: ConsentChoice) {
  if (typeof document === "undefined") return;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(
    `${CONSENT_VERSION}:${choice}`,
  )}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  window.dispatchEvent(
    new CustomEvent<ConsentChoice>(CONSENT_CHANGE_EVENT, { detail: choice }),
  );
}

/**
 * The single check analytics must make before loading. False until the user
 * has explicitly accepted (no choice = no consent).
 */
export function hasAnalyticsConsent(): boolean {
  return getConsent() === "accepted";
}

/** Reopens the consent banner so the user can change their choice. */
export function openCookieSettings() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(OPEN_CONSENT_EVENT));
}
