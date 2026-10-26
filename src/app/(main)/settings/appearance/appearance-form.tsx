"use client";

import {
  ACCENTS,
  THEMES,
  setAppearance,
  type AccentId,
  type ThemeId,
} from "@/lib/appearance";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { useState } from "react";

interface AppearanceFormProps {
  initialTheme: ThemeId;
  initialAccent: AccentId;
}

const groupLabelClass =
  "mb-3 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]";

const swatchButtonClass =
  "group flex flex-col items-center gap-2 rounded-2xl outline-none transition-transform duration-150 active:scale-95 focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--pf-bg)]";

/** Small accent-coloured tick shown on the selected swatch. */
function SelectedTick({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "grid h-5 w-5 place-items-center rounded-full bg-[var(--pf-volt)] text-[var(--pf-on-accent)] shadow-[0_2px_6px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <Check className="h-3 w-3" strokeWidth={3} />
    </span>
  );
}

export function AppearanceForm({
  initialTheme,
  initialAccent,
}: AppearanceFormProps) {
  const [theme, setTheme] = useState<ThemeId>(initialTheme);
  const [accent, setAccent] = useState<AccentId>(initialAccent);

  return (
    <div className="space-y-8">
      <section>
        <h2 id="appearance-background" className={groupLabelClass}>
          Background
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="appearance-background"
          className="grid grid-cols-4 gap-3"
        >
          {THEMES.map((option) => {
            const selected = option.id === theme;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(option.id);
                  setAppearance({ theme: option.id });
                }}
                className={swatchButtonClass}
              >
                {/* Mini preview of the base, with the current accent. */}
                <span
                  className={cn(
                    "relative flex aspect-[3/4] w-full flex-col gap-1.5 overflow-hidden rounded-2xl border-2 p-2 transition-colors",
                    selected
                      ? "border-[var(--pf-volt)]"
                      : "border-[var(--pf-border)] group-hover:border-[var(--pf-border-light)]",
                  )}
                  style={{ background: option.bg }}
                >
                  <span
                    className="h-2 w-3/4 rounded-full opacity-90"
                    style={{ background: option.text }}
                  />
                  <span
                    className="h-1.5 w-1/2 rounded-full opacity-40"
                    style={{ background: option.text }}
                  />
                  <span
                    className="mt-auto h-5 w-full rounded-lg"
                    style={{ background: option.surface }}
                  />
                  <span className="h-2 w-2/3 rounded-full bg-[var(--pf-volt)]" />
                  {selected && (
                    <SelectedTick className="absolute right-1.5 top-1.5" />
                  )}
                </span>
                <span
                  className={cn(
                    "text-xs font-semibold",
                    selected
                      ? "text-[var(--pf-text)]"
                      : "text-[var(--pf-text-3)]",
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 id="appearance-accent" className={groupLabelClass}>
          Accent
        </h2>
        <div
          role="radiogroup"
          aria-labelledby="appearance-accent"
          className="grid grid-cols-4 gap-x-3 gap-y-5"
        >
          {ACCENTS.map((option) => {
            const selected = option.id === accent;
            return (
              <button
                key={option.id}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => {
                  setAccent(option.id);
                  setAppearance({ accent: option.id });
                }}
                className={swatchButtonClass}
              >
                <span
                  className={cn(
                    "grid h-12 w-12 place-items-center rounded-full ring-offset-2 ring-offset-[var(--pf-bg)] transition-shadow",
                    selected
                      ? "ring-2 ring-[var(--pf-text)]"
                      : "ring-0 group-hover:ring-1 group-hover:ring-[var(--pf-border-light)]",
                  )}
                  style={{ background: option.color }}
                >
                  {selected && (
                    <Check
                      className="h-5 w-5"
                      strokeWidth={3}
                      style={{ color: option.onAccent }}
                    />
                  )}
                </span>
                <span
                  className={cn(
                    "text-center text-[11px] font-semibold leading-tight",
                    selected
                      ? "text-[var(--pf-text)]"
                      : "text-[var(--pf-text-3)]",
                  )}
                >
                  {option.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Live sample so the accent + on-accent pairing is easy to judge. */}
      <section>
        <h2 className={groupLabelClass}>Preview</h2>
        <div className="space-y-3 rounded-2xl border border-[var(--pf-border)] bg-[var(--pf-surface)] p-4">
          <p className="text-[15px] font-semibold text-[var(--pf-text)]">
            5-a-side tonight, 2 spots left
          </p>
          <p className="text-[13px] text-[var(--pf-text-2)]">
            Toryglen · 7pm ·{" "}
            <span className="font-semibold text-[var(--pf-volt)]">
              Looking to play
            </span>
          </p>
          <div className="flex gap-2">
            <span className="rounded-xl bg-[var(--pf-volt)] px-4 py-2 text-sm font-bold text-[var(--pf-on-accent)]">
              I’m in
            </span>
            <span className="rounded-xl border border-[var(--pf-border-light)] px-4 py-2 text-sm font-semibold text-[var(--pf-text-2)]">
              Message
            </span>
          </div>
        </div>
        <p className="mt-3 text-xs leading-relaxed text-[var(--pf-text-3)]">
          Evaluation preview: light backgrounds aren’t fully supported yet, so
          some screens will still look dark.
        </p>
      </section>
    </div>
  );
}
