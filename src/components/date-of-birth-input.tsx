"use client";

import { cn } from "@/lib/utils";
import { useEffect, useId, useState } from "react";

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

interface DateOfBirthInputProps {
  /** "YYYY-MM-DD", or "" while incomplete. */
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  invalid?: boolean;
  /** Extra classes for each box (to match the surrounding form's inputs). */
  fieldClassName?: string;
  describedBy?: string;
}

function split(value: string) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return m
    ? { day: String(Number(m[3])), month: String(Number(m[2])), year: m[1] }
    : null;
}

/**
 * Day / month / year boxes instead of the browser's date picker: quicker for a
 * birthday (no scrolling back through decades) and it looks the same on every
 * phone and browser.
 */
export function DateOfBirthInput({
  value,
  onChange,
  onBlur,
  invalid,
  fieldClassName,
  describedBy,
}: DateOfBirthInputProps) {
  const id = useId();
  const initial = split(value);
  const [day, setDay] = useState(initial?.day ?? "");
  const [month, setMonth] = useState(initial?.month ?? "");
  const [year, setYear] = useState(initial?.year ?? "");

  // Keep in sync if the form resets the value from outside.
  useEffect(() => {
    if (value === "") return;
    const parts = split(value);
    if (parts) {
      setDay(parts.day);
      setMonth(parts.month);
      setYear(parts.year);
    }
  }, [value]);

  const emit = (d: string, m: string, y: string) => {
    if (d && m && /^\d{4}$/.test(y)) {
      onChange(`${y}-${m.padStart(2, "0")}-${d.padStart(2, "0")}`);
    } else {
      onChange("");
    }
  };

  const box = cn(
    "h-12 w-full min-w-0 rounded-2xl border bg-[var(--pf-surface)] px-4 text-base text-[var(--pf-text)] outline-none transition-colors placeholder:text-[var(--pf-text-4)] focus:border-[var(--pf-volt)] lg:text-[15px]",
    invalid ? "border-[#ef4444]" : "border-[var(--pf-border)]",
    fieldClassName,
  );

  return (
    <div
      className="grid w-full grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_minmax(0,1.2fr)] gap-2"
      role="group"
      aria-describedby={describedBy}
    >
      <label className="flex min-w-0 flex-col gap-1">
        <span className="text-[12px] text-[var(--pf-text-3)]">Day</span>
        <input
          id={`${id}-day`}
          inputMode="numeric"
          autoComplete="bday-day"
          placeholder="DD"
          maxLength={2}
          value={day}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const d = e.target.value.replace(/\D/g, "").slice(0, 2);
            setDay(d);
            emit(d, month, year);
          }}
          onBlur={onBlur}
          className={box}
        />
      </label>
      <label className="flex min-w-0 flex-col gap-1">
        <span className="text-[12px] text-[var(--pf-text-3)]">Month</span>
        <select
          id={`${id}-month`}
          autoComplete="bday-month"
          value={month}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            setMonth(e.target.value);
            emit(day, e.target.value, year);
          }}
          onBlur={onBlur}
          className={cn(
            box,
            "appearance-none pr-2",
            !month && "text-[var(--pf-text-4)]",
          )}
        >
          <option value="" disabled>
            Month
          </option>
          {MONTHS.map((name, i) => (
            <option key={name} value={String(i + 1)}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex min-w-0 flex-col gap-1">
        <span className="text-[12px] text-[var(--pf-text-3)]">Year</span>
        <input
          id={`${id}-year`}
          inputMode="numeric"
          autoComplete="bday-year"
          placeholder="YYYY"
          maxLength={4}
          value={year}
          aria-invalid={invalid || undefined}
          onChange={(e) => {
            const y = e.target.value.replace(/\D/g, "").slice(0, 4);
            setYear(y);
            emit(day, month, y);
          }}
          onBlur={onBlur}
          className={box}
        />
      </label>
    </div>
  );
}
