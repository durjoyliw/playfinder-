import { CircleCheck } from "lucide-react";
import Link from "next/link";

interface FeedEndProps {
  /** What the list was, e.g. "posts" or "games". */
  noun?: string;
  action?: { href: string; label: string };
}

/** Shown under the last item so a list ends on purpose, not on a blank gap. */
export function FeedEnd({ noun = "posts", action }: FeedEndProps) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 pb-10 pt-8 text-center">
      <CircleCheck
        className="h-6 w-6 text-[var(--pf-c-ink-7e8a7e)]"
        aria-hidden
      />
      <p className="text-sm font-semibold text-[var(--pf-text)]">
        You&apos;re all caught up
      </p>
      <p className="max-w-[260px] text-[13px] leading-relaxed text-[var(--pf-text-3)]">
        That&apos;s all the {noun} for now. New ones show up here as people
        post.
      </p>
      {action && (
        <Link
          href={action.href}
          className="mt-2 text-sm font-semibold text-[var(--pf-volt-text)] hover:underline"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}
