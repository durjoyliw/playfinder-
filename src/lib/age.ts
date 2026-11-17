/**
 * 18+ age gate helpers, shared by email signup (client + server validation)
 * and the post-Google-signup date-of-birth step.
 *
 * Dates of birth travel as "YYYY-MM-DD" (what <input type="date"> gives)
 * and are stored as UTC midnight, so no time zone can shift the day.
 */

export const MINIMUM_AGE = 18;
export const UNDER_AGE_MESSAGE = "You must be 18 or over to use PlayFinder.";
const OLDEST_YEAR = 1900;

/** Parses "YYYY-MM-DD" into a UTC-midnight Date, or null if invalid. */
export function parseBirthDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());
  if (!match) return null;
  const [year, month, day] = match.slice(1).map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  // Reject rollovers like 2001-02-31.
  if (
    date.getUTCFullYear() !== year ||
    date.getUTCMonth() !== month - 1 ||
    date.getUTCDate() !== day
  ) {
    return null;
  }
  return date;
}

/** Whole years between birthDate and `now` (birthday counts on the day). */
export function getAge(birthDate: Date, now: Date = new Date()): number {
  let age = now.getUTCFullYear() - birthDate.getUTCFullYear();
  const beforeBirthday =
    now.getUTCMonth() < birthDate.getUTCMonth() ||
    (now.getUTCMonth() === birthDate.getUTCMonth() &&
      now.getUTCDate() < birthDate.getUTCDate());
  if (beforeBirthday) age -= 1;
  return age;
}

export type BirthDateCheck =
  | { ok: true; birthDate: Date }
  | { ok: false; reason: "invalid" | "underage"; message: string };

/** One place that decides whether a date of birth may join. */
export function checkBirthDate(
  value: string | null | undefined,
  now: Date = new Date(),
): BirthDateCheck {
  const birthDate = parseBirthDate(value);
  if (
    !birthDate ||
    birthDate.getUTCFullYear() < OLDEST_YEAR ||
    birthDate.getTime() > now.getTime()
  ) {
    return {
      ok: false,
      reason: "invalid",
      message: "Enter a valid date of birth.",
    };
  }
  if (getAge(birthDate, now) < MINIMUM_AGE) {
    return { ok: false, reason: "underage", message: UNDER_AGE_MESSAGE };
  }
  return { ok: true, birthDate };
}

/** "YYYY-MM-DD" for today, for the date input's `max`. */
export function todayIsoDate(now: Date = new Date()): string {
  return now.toISOString().slice(0, 10);
}

/** Accounts that must confirm a DOB before entering the app. */
export function needsBirthDate(user: {
  birthDate: Date | null;
  completedOnboarding: boolean;
}): boolean {
  // Already-onboarded accounts predate the gate and are grandfathered.
  return !user.birthDate && !user.completedOnboarding;
}
