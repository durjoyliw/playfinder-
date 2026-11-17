import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  body: string;
  action?: { href: string; label: string };
}

/** What's empty, why it matters, and one thing to do about it. */
export function EmptyState({
  icon: Icon,
  title,
  body,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center px-8 py-20 text-center">
      <span className="pf-card grid h-14 w-14 place-items-center rounded-2xl bg-[var(--pf-surface)] text-[var(--pf-volt-text)]">
        <Icon className="h-6 w-6" aria-hidden />
      </span>
      <h2 className="mt-5 text-[19px] font-bold tracking-[-0.02em] text-[var(--pf-text)]">
        {title}
      </h2>
      <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-[var(--pf-text-3)]">
        {body}
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-6 rounded-xl bg-[var(--pf-volt)] px-5 py-2.5 text-sm font-bold text-[var(--pf-on-accent)] transition-[filter] hover:brightness-110"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
