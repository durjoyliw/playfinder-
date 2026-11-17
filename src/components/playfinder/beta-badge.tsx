import { cn } from "@/lib/utils";

/** Small "BETA" pill shown next to the PlayFinder wordmark during the beta. */
export function BetaBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full border border-[rgb(var(--pf-volt-rgb)/0.45)] px-1.5 py-[1px] font-dm-mono text-[9.5px] font-medium uppercase leading-[1.5] tracking-[0.12em] text-[var(--pf-volt-text)]",
        className,
      )}
    >
      Beta
    </span>
  );
}
