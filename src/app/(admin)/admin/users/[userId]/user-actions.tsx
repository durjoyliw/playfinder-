"use client";

import {
  banUser,
  disableEventCreation,
  disableMessaging,
  liftUserRestriction,
  restrictUser,
  timedSuspendUser,
  warnUser,
} from "@/lib/admin/users";
import { useState, useTransition } from "react";

const btn =
  "h-10 rounded-md border px-4 text-sm disabled:opacity-40 hover:bg-[#121412]";

export function UserActionPanel({
  userId,
  status,
}: {
  userId: string;
  status: string;
}) {
  const [reason, setReason] = useState("");
  const [duration, setDuration] = useState("24h");
  const [pending, startTransition] = useTransition();
  const note = () => reason.trim();

  function run(action: () => Promise<void>) {
    startTransition(() => {
      void action();
    });
  }

  return (
    <section className="space-y-4 rounded-xl border border-[#2a2f2a] bg-[#121412] p-5">
      <h2 className="text-sm font-semibold">Moderation actions</h2>
      <label className="block space-y-1.5 text-sm">
        <span className="text-[#8a8f86]">Reason (optional, stored on AuditLog)</span>
        <textarea
          value={reason}
          onChange={(event) => setReason(event.target.value)}
          rows={2}
          className="w-full rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 py-2 text-sm outline-none focus:border-[#dcef5a]"
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          disabled={pending}
          className={`${btn} border-[#2a2f2a]`}
          onClick={() => run(() => warnUser(userId, note() || "Warning issued"))}
        >
          Warn
        </button>
        <button
          type="button"
          disabled={pending || status === "RESTRICTED"}
          className={`${btn} border-[#2a2f2a]`}
          onClick={() =>
            run(() => restrictUser(userId, note() || undefined))
          }
        >
          Restrict
        </button>
        <button
          type="button"
          disabled={pending || status === "MESSAGING_DISABLED"}
          className={`${btn} border-[#2a2f2a]`}
          onClick={() =>
            run(() => disableMessaging(userId, note() || undefined))
          }
        >
          Disable messaging
        </button>
        <button
          type="button"
          disabled={pending || status === "EVENT_CREATION_DISABLED"}
          className={`${btn} border-[#2a2f2a]`}
          onClick={() =>
            run(() => disableEventCreation(userId, note() || undefined))
          }
        >
          Disable event creation
        </button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <label className="space-y-1.5 text-sm">
          <span className="text-[#8a8f86]">Timed suspension</span>
          <select
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            className="block h-10 rounded-md border border-[#2a2f2a] bg-[#08090a] px-3 text-sm"
          >
            <option value="24h">24h</option>
            <option value="48h">48h</option>
            <option value="7d">7 days</option>
            <option value="30d">30 days</option>
          </select>
        </label>
        <button
          type="button"
          disabled={pending}
          className={`${btn} border-amber-800/70 text-amber-300 hover:bg-amber-950/40`}
          onClick={() =>
            run(() => timedSuspendUser(userId, duration, note() || undefined))
          }
        >
          Apply suspension
        </button>
        <button
          type="button"
          disabled={pending || status === "BANNED"}
          className={`${btn} border-red-900/70 text-red-300 hover:bg-red-950/40`}
          onClick={() => run(() => banUser(userId, note() || undefined))}
        >
          Permanent ban
        </button>
        <button
          type="button"
          disabled={pending || status === "ACTIVE"}
          className={`${btn} border-[#dcef5a]/40 text-[#dcef5a] hover:bg-[#1a1d1a]`}
          onClick={() =>
            run(() => liftUserRestriction(userId, note() || undefined))
          }
        >
          Lift restriction / Unsuspend / Unban
        </button>
      </div>
    </section>
  );
}
