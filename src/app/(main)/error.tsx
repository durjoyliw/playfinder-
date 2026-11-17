"use client";

import { StatusScreen } from "@/components/system/status-screen";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      eyebrow="Error"
      title="This page didn't load"
      description="Try again. If it keeps happening, send us feedback from the menu so we can fix it."
      homeHref="/home"
      homeLabel="Back to the feed"
      action={
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-[var(--pf-volt)] px-6 py-2.5 text-sm font-bold text-[var(--pf-on-accent)] transition-colors hover:bg-[var(--pf-volt-hover)]"
        >
          Try again
        </button>
      }
    />
  );
}
