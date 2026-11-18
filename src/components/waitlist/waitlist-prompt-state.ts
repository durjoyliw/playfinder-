/**
 * Local memory for the one-time waitlist prompt. Browser storage only:
 * worst case (private mode, cleared data) someone sees the prompt once more.
 */

const FIRST_DAY_KEY = "pf_first_day";
const PROMPT_KEY = "pf_waitlist_prompt";

function today(): string {
  // Local date, e.g. "2026-11-18".
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Storage blocked: the prompt may show again, which is harmless.
  }
}

/**
 * True on a later day than the first time this browser opened the app,
 * as long as the prompt hasn't been answered. Records the first day.
 */
export function shouldShowWaitlistPrompt(): boolean {
  if (typeof window === "undefined") return false;
  if (read(PROMPT_KEY)) return false;
  const first = read(FIRST_DAY_KEY);
  if (!first) {
    write(FIRST_DAY_KEY, today());
    return false;
  }
  return first !== today();
}

export function markWaitlistPromptDismissed() {
  write(PROMPT_KEY, "dismissed");
}

export function markWaitlistJoined() {
  if (typeof window === "undefined") return;
  write(PROMPT_KEY, "joined");
}
