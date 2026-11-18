/**
 * Reads the game time the composer writes ("Sat 21 Nov, 7:30 am") so the
 * Arena card can show a calendar tile. Free-text times ("Tonight 7pm")
 * return null and the card falls back to the sport emoji.
 */

const MONTHS = [
  "jan",
  "feb",
  "mar",
  "apr",
  "may",
  "jun",
  "jul",
  "aug",
  "sep",
  "oct",
  "nov",
  "dec",
];

const LABEL_RE =
  /^\s*(mon|tue|wed|thu|fri|sat|sun)[a-z]*\.?\s+(\d{1,2})\s+([a-z]{3})[a-z]*\.?,?\s*(.*)$/i;

const RELATIVE_RE = /^\s*(tonight|today|tomorrow)\b[\s,@-]*(?:at\s+)?(.*)$/i;
const TIME_RE = /^(\d{1,2})(?:[:.](\d{2}))?\s*(am|pm)?$/i;

/** "7 PM" -> "7pm", "19:30" -> "19:30"; anything else -> null. */
function shortTime(text: string): string | null {
  const m = TIME_RE.exec(text.trim());
  if (!m) return null;
  const [, h, min, ampm] = m;
  return `${h}${min ? `:${min}` : ""}${ampm ? ampm.toLowerCase() : ""}`;
}

export interface ArenaWhen {
  /** "SAT", or "TODAY" / "TMRW" / "TONIGHT" when it's that close. */
  dayLabel: string;
  /** Day of the month ("21"), or the time ("7pm") for "Tonight 7pm". */
  date: string;
  /** Time part, "7:30 am" ("" if the label had none). */
  time: string;
  isToday: boolean;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function parseArenaWhen(
  label: string | null | undefined,
  now: Date = new Date(),
): ArenaWhen | null {
  if (!label) return null;

  // Written times like "Tonight 7 PM" / "Tomorrow 10am".
  const relative = RELATIVE_RE.exec(label);
  if (relative) {
    const word = relative[1].toLowerCase();
    const time = shortTime(relative[2]);
    if (!time) return null;
    return {
      dayLabel: word === "tomorrow" ? "TMRW" : word.toUpperCase(),
      date: time,
      time: "",
      isToday: word !== "tomorrow",
    };
  }

  const match = LABEL_RE.exec(label);
  if (!match) return null;

  const [, weekday, day, monthName, rest] = match;
  const month = MONTHS.indexOf(monthName.toLowerCase());
  const dayNum = Number(day);
  if (month < 0 || dayNum < 1 || dayNum > 31) return null;

  // The label has no year: take the nearest one (a "Jan" game seen in
  // December is next year).
  let when = new Date(now.getFullYear(), month, dayNum);
  const sixtyDays = 60 * 24 * 60 * 60 * 1000;
  if (now.getTime() - when.getTime() > sixtyDays) {
    when = new Date(now.getFullYear() + 1, month, dayNum);
  }

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isToday = sameDay(when, now);
  const isTomorrow = sameDay(when, tomorrow);

  return {
    dayLabel: isToday ? "TODAY" : isTomorrow ? "TMRW" : weekday.toUpperCase(),
    date: String(dayNum),
    time: rest.trim(),
    isToday,
  };
}
