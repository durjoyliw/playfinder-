"use client";

import { useSession } from "@/app/(main)/SessionProvider";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { deleteAccount } from "./actions";

const listClass =
  "mt-2 list-disc space-y-1.5 pl-5 text-[13px] leading-relaxed text-[var(--pf-text-2)] marker:text-[var(--pf-text-4)]";

/**
 * Two explicit gates before the destructive call: type your username and
 * tick the acknowledgement. The server action re-checks the username.
 */
export function DeleteAccountForm() {
  const { user } = useSession();
  const queryClient = useQueryClient();
  const [typed, setTyped] = useState("");
  const [acknowledged, setAcknowledged] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const matches =
    typed.trim().replace(/^@/, "").toLowerCase() === user.username.toLowerCase();
  const canDelete = matches && acknowledged && !isPending;

  const handleDelete = () => {
    if (!canDelete) return;
    setError(null);
    startTransition(async () => {
      const result = await deleteAccount(typed);
      // On success the action redirects and never returns.
      if (result?.error) {
        setError(result.error);
        return;
      }
      queryClient.clear();
    });
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-[rgb(239_68_68/0.35)] bg-[rgb(239_68_68/0.08)] p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[#ef4444]" />
          <div>
            <p className="text-[15px] font-semibold text-[var(--pf-text)]">
              This permanently deletes your account
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[var(--pf-text-2)]">
              It can’t be undone, and we can’t restore anything afterwards.
            </p>
          </div>
        </div>
      </div>

      <section className="rounded-2xl bg-[var(--pf-surface)] p-4 pf-card">
        <h2 className="font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
          What gets deleted
        </h2>
        <ul className={listClass}>
          <li>Your profile, photo, sports, location and settings</li>
          <li>
            Everything you posted (including posts you made as a Page), with
            their photos, comments, likes and saves
          </li>
          <li>Your comments, likes, saved posts and “I’m in” requests</li>
          <li>Your followers, following, teammates, blocks and mutes</li>
          <li>Your messages and chats, and your notifications</li>
          <li>Push notification subscriptions, reports you filed, and appeals</li>
        </ul>

        <h2 className="mt-5 font-dm-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[var(--pf-text-3)]">
          What stays
        </h2>
        <ul className={listClass}>
          <li>
            Pages you created or manage stay up. If you’re a Page’s only owner,
            it becomes unclaimed so someone else can claim it.
          </li>
          <li>
            Moderation records about your account, kept to keep PlayFinder safe.
          </li>
        </ul>
      </section>

      <section className="space-y-4 rounded-2xl bg-[var(--pf-surface)] p-4 pf-card">
        <label className="block">
          <span className="text-[13px] font-medium text-[var(--pf-text-2)]">
            Type your username{" "}
            <span className="font-semibold text-[var(--pf-text)]">
              @{user.username}
            </span>{" "}
            to confirm
          </span>
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            placeholder={`@${user.username}`}
            className="mt-2 w-full rounded-xl border border-[var(--pf-border)] bg-[var(--pf-bg)] px-3.5 py-2.5 text-base text-[var(--pf-text)] outline-none placeholder:text-[var(--pf-text-4)] focus:border-[#ef4444] lg:text-sm"
          />
        </label>

        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acknowledged}
            onChange={(e) => setAcknowledged(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 accent-[#ef4444]"
          />
          <span className="text-[13px] leading-relaxed text-[var(--pf-text-2)]">
            I understand my account and everything listed above will be deleted
            permanently.
          </span>
        </label>

        {error && (
          <p role="alert" className="text-[13px] font-medium text-[#ef4444]">
            {error}
          </p>
        )}

        <button
          type="button"
          onClick={handleDelete}
          disabled={!canDelete}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#dc2626] py-3 text-sm font-semibold text-white transition-[background-color,transform,opacity] hover:bg-[#b91c1c] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
          {isPending ? "Deleting…" : "Delete my account"}
        </button>
      </section>
    </div>
  );
}
