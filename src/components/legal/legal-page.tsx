import { cn } from "@/lib/utils";
import Link from "next/link";

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
  { href: "/cookies", label: "Cookie Policy" },
] as const;

type LegalHref = (typeof LEGAL_LINKS)[number]["href"];

interface LegalPageProps {
  title: string;
  /** "Last updated" date; omit on pages that aren't policies (e.g. /contact). */
  updated?: string;
  /** Which policy link to highlight in the footer nav, if any. */
  current?: LegalHref;
  /** Small label above the title. */
  eyebrow?: string;
  children: React.ReactNode;
}

/** Shared shell for the public legal + support pages (/privacy, /terms, /cookies, /contact). */
export function LegalPage({
  title,
  updated,
  current,
  eyebrow = "Legal",
  children,
}: LegalPageProps) {
  return (
    <div className="min-h-screen bg-[var(--pf-bg)] font-grotesk text-[var(--pf-text)]">
      <header className="border-b border-[var(--pf-border)]">
        <div className="mx-auto flex w-full max-w-[480px] items-center px-4 py-4 lg:max-w-[600px]">
          <Link
            href="/"
            className="text-lg font-bold italic text-[var(--pf-volt-text)]"
          >
            PlayFinder
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-[480px] px-4 pb-20 pt-10 lg:max-w-[600px]">
        <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
          {eyebrow}
        </p>
        <h1 className="mt-2 text-[30px] font-bold leading-tight tracking-[-0.03em] text-[var(--pf-c-ink-ffffff)]">
          {title}
        </h1>
        {updated && (
          <p className="mt-2 text-[13px] text-[var(--pf-text-3)]">
            Last updated: {updated}
          </p>
        )}

        <div className="mt-10 space-y-10 text-[15px] leading-[1.7] text-[var(--pf-text-2)]">
          {children}
        </div>

        <nav
          aria-label="Legal documents"
          className="mt-16 border-t border-[var(--pf-border)] pt-8"
        >
          <p className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
            Policies
          </p>
          <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {LEGAL_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  aria-current={link.href === current ? "page" : undefined}
                  className={cn(
                    "transition-colors hover:text-[var(--pf-c-ink-ffffff)]",
                    link.href === current
                      ? "font-semibold text-[var(--pf-text)]"
                      : "text-[var(--pf-text-3)]",
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </main>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <h2 className="text-[19px] font-bold leading-snug tracking-[-0.02em] text-[var(--pf-text)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function LegalList({ children }: { children: React.ReactNode }) {
  return (
    <ul className="list-disc space-y-3 pl-5 marker:text-[var(--pf-text-4)]">
      {children}
    </ul>
  );
}

/** Bold lead-in label for a list item, e.g. "Account data:". */
export function LegalTerm({ children }: { children: React.ReactNode }) {
  return (
    <strong className="font-semibold text-[var(--pf-text)]">{children}</strong>
  );
}

export function LegalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const external = href.startsWith("http");
  return (
    <Link
      href={href}
      className="text-[var(--pf-text)] underline decoration-[var(--pf-text-4)] underline-offset-4 transition-colors hover:decoration-[var(--pf-volt)]"
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </Link>
  );
}
