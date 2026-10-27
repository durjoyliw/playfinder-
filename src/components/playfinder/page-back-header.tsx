"use client";

import { useSafeBack } from "@/hooks/use-safe-back";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface PageBackHeaderProps {
  title: string;
  className?: string;
  /** Where the back arrow goes when there is no in-app history to go back to. */
  backHref?: string;
  /** Bottom-nav tab pages are destinations, not sub-pages: no back arrow. */
  showBack?: boolean;
}

/**
 * Top bar for screens that are not the app's main tabs. On mobile the shell
 * hides the global header on these routes, so this is the only header shown.
 */
export function PageBackHeader({
  title,
  className,
  backHref = "/home",
  showBack = true,
}: PageBackHeaderProps) {
  const goBack = useSafeBack(backHref);

  return (
    <div
      className={cn(
        "sticky top-0 z-[var(--pf-z-header)] flex min-h-[57px] items-center justify-center border-b border-[var(--pf-border)] bg-[rgb(var(--pf-c-fill-08090a-rgb)/0.92)] px-4 py-4 backdrop-blur-[20px]",
        className,
      )}
    >
      {showBack && (
        <button
          type="button"
          onClick={goBack}
          className="absolute left-2 grid h-10 w-10 place-items-center rounded-xl text-[var(--pf-c-ink-ffffff)] outline-none transition-transform active:scale-90 active:bg-[var(--pf-surface)] focus-visible:ring-2 focus-visible:ring-[var(--pf-volt)]"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
      )}
      <h1 className="text-lg font-semibold text-[var(--pf-c-ink-ffffff)]">{title}</h1>
    </div>
  );
}
