import Link from "next/link";

interface StatusScreenProps {
  eyebrow: string;
  title: string;
  description: string;
  /** Optional primary action (e.g. "Try again"), rendered before the link. */
  action?: React.ReactNode;
  homeHref?: string;
  homeLabel?: string;
}

/** Friendly full-width message used by the 404 and error pages. */
export function StatusScreen({
  eyebrow,
  title,
  description,
  action,
  homeHref = "/",
  homeLabel = "Go home",
}: StatusScreenProps) {
  return (
    <main className="flex min-h-[70dvh] w-full flex-col items-center justify-center px-6 py-16 text-center font-grotesk">
      <p className="font-dm-mono text-[11px] uppercase tracking-[0.16em] text-[var(--pf-volt-text)]">
        {eyebrow}
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] text-[var(--pf-c-ink-ffffff)]">
        {title}
      </h1>
      <p className="mt-3 max-w-sm text-[15px] leading-relaxed text-[var(--pf-c-ink-a3a3a3)]">
        {description}
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {action}
        <Link
          href={homeHref}
          className="rounded-full border border-[var(--pf-c-line-2a2a2a)] px-6 py-2.5 text-sm font-semibold text-[var(--pf-c-ink-ffffff)] transition-colors hover:bg-[var(--pf-c-fill-161616)]"
        >
          {homeLabel}
        </Link>
      </div>
    </main>
  );
}
