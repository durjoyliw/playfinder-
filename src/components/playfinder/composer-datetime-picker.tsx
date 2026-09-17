"use client";

import {
  formatBroadcastTimeLabel,
  toDatetimeLocalValue,
} from "@/lib/broadcast-time";
import { cn } from "@/lib/utils";
import { useMemo, useState } from "react";

const TIME_SLOTS = Array.from({ length: 36 }, (_, i) => {
  const totalMinutes = 6 * 60 + i * 30;
  return {
    hours: Math.floor(totalMinutes / 60),
    minutes: totalMinutes % 60,
  };
});

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatTimeSlot(hours: number, minutes: number) {
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date.toLocaleTimeString("en-GB", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function upcomingSaturday(from: Date) {
  const next = startOfDay(from);
  const day = next.getDay();
  const add = day === 6 ? 0 : (6 - day + 7) % 7;
  next.setDate(next.getDate() + add);
  return next;
}

interface ComposerDateTimePickerProps {
  value: string;
  onChange: (datetimeLocal: string) => void;
}

export function ComposerDateTimePicker({
  value,
  onChange,
}: ComposerDateTimePickerProps) {
  const [open, setOpen] = useState(false);
  const selected = value ? new Date(value) : null;
  const today = useMemo(() => startOfDay(new Date()), []);

  const days = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
      }),
    [today],
  );

  const apply = (date: Date, hours?: number, minutes?: number) => {
    const next = new Date(date);
    if (hours != null && minutes != null) {
      next.setHours(hours, minutes, 0, 0);
    } else if (selected) {
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
    } else {
      const fallback = new Date();
      fallback.setHours(fallback.getHours() + 2, 0, 0, 0);
      next.setHours(fallback.getHours(), 0, 0, 0);
    }
    onChange(toDatetimeLocalValue(next));
  };

  const label = selected
    ? formatBroadcastTimeLabel(selected.toISOString())
    : "When is the game?";

  const tomorrow = useMemo(() => {
    const date = new Date(today);
    date.setDate(today.getDate() + 1);
    return date;
  }, [today]);

  const weekend = useMemo(() => upcomingSaturday(today), [today]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="w-full text-left text-[15px] text-white"
        aria-expanded={open}
      >
        <span className={selected ? "text-white" : "text-[#888888]"}>
          {label}
        </span>
      </button>

      {open && (
        <div className="mt-3 space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {[
              { date: today, label: "Today" },
              { date: tomorrow, label: "Tomorrow" },
              { date: weekend, label: "Weekend" },
            ].map((chip) => {
              const active = selected ? sameDay(selected, chip.date) : false;
              return (
                <button
                  key={chip.label}
                  type="button"
                  onClick={() => apply(chip.date)}
                  className={cn(
                    "rounded-[10px] border px-3 py-1.5 text-xs font-semibold",
                    active
                      ? "border-[#C8FF00] bg-[#C8FF00] text-black"
                      : "border-[#2a2f2a] text-[#b4bcaf]",
                  )}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {days.map((date) => {
              const active = selected ? sameDay(selected, date) : false;
              return (
                <button
                  key={date.toISOString()}
                  type="button"
                  onClick={() => apply(date)}
                  className={cn(
                    "flex h-[58px] w-11 shrink-0 flex-col items-center justify-center rounded-[12px] border",
                    active
                      ? "border-[#C8FF00] bg-[#C8FF00] text-black"
                      : "border-[#2a2f2a] text-[#b4bcaf]",
                  )}
                >
                  <span className="font-dm-mono text-[9px] font-medium uppercase tracking-wider">
                    {date.toLocaleDateString("en-GB", { weekday: "short" })}
                  </span>
                  <span className="text-[15px] font-bold leading-none">
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-1.5 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {TIME_SLOTS.map((slot) => {
              const active =
                selected?.getHours() === slot.hours &&
                selected?.getMinutes() === slot.minutes;
              return (
                <button
                  key={`${slot.hours}-${slot.minutes}`}
                  type="button"
                  onClick={() =>
                    apply(selected ?? new Date(), slot.hours, slot.minutes)
                  }
                  className={cn(
                    "shrink-0 whitespace-nowrap rounded-[10px] border px-3 py-2 text-xs font-semibold",
                    active
                      ? "border-[#C8FF00] bg-[#C8FF00] text-black"
                      : "border-[#2a2f2a] text-[#b4bcaf]",
                  )}
                >
                  {formatTimeSlot(slot.hours, slot.minutes)}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
