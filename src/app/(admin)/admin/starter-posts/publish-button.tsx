"use client";

import { publishStarterPosts } from "@/lib/admin/starter-posts";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export function PublishButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError(null);
            try {
              const r = await publishStarterPosts();
              const parts = [
                r.officialAccountCreated
                  ? "Created the PlayFinder account."
                  : null,
                r.startersAdded.length
                  ? `Starters posted in: ${r.startersAdded.join(", ")}.`
                  : "No new starters needed.",
                `Padel demo posts added: ${r.padelAdded}.`,
                r.missingDemoAccounts.length
                  ? `Demo accounts not found (skipped): ${r.missingDemoAccounts.join(", ")}.`
                  : null,
              ].filter(Boolean);
              setSummary(parts.join(" "));
              router.refresh();
            } catch (e) {
              console.error(e);
              setError("That didn't work. Check the server logs.");
            }
          })
        }
        className="rounded-md bg-[#a1c217] px-4 py-2 text-sm font-semibold text-[#0a0b0a] disabled:opacity-55"
      >
        {pending ? "Publishing…" : "Publish starter posts"}
      </button>
      {summary && <p className="text-sm text-[#a1c217]">{summary}</p>}
      {error && <p className="text-sm text-red-400">{error}</p>}
    </div>
  );
}
