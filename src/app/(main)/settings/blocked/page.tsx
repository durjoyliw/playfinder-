"use client";

import { PageBackHeader } from "@/components/playfinder/page-back-header";
import kyInstance from "@/lib/ky";
import { useEffect, useMemo, useState } from "react";

type BlockRow = {
  id: string;
  blockedId: string;
  blocked: {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
  };
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? parts.at(-1)?.[0] ?? "" : "";
  return (first + last).toUpperCase();
}

export default function Page() {
  const [blocks, setBlocks] = useState<BlockRow[] | null>(null);
  const blockedUsers = useMemo(() => blocks ?? [], [blocks]);

  useEffect(() => {
    let cancelled = false;
    kyInstance
      .get("/api/users/blocked")
      .json<BlockRow[]>()
      .then((data) => {
        if (!cancelled) setBlocks(data);
      })
      .catch((error) => {
        console.error(error);
        if (!cancelled) setBlocks([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleUnblock(userId: string) {
    setBlocks((prev) => (prev ? prev.filter((b) => b.blocked.id !== userId) : prev));
    try {
      await kyInstance.delete(`/api/users/${userId}/block`);
    } catch (error) {
      console.error(error);
      // Re-fetch on failure to avoid stale optimistic state.
      const refreshed = await kyInstance.get("/api/users/blocked").json<BlockRow[]>();
      setBlocks(refreshed);
    }
  }

  return (
    <div className="min-h-full bg-[#0d0d0d] pb-8">
      <PageBackHeader title="Blocked Accounts" />

      {blocks === null ? (
        <div className="px-4 pt-6">
          <p className="text-sm text-[#888888]">Loading…</p>
        </div>
      ) : blockedUsers.length === 0 ? (
        <div className="px-4 pt-6">
          <p className="text-sm text-[#888888]">
            You haven&apos;t blocked anyone
          </p>
        </div>
      ) : (
        <div className="px-4 pt-4">
          <div className="flex flex-col gap-2">
            {blockedUsers.map((b) => (
              <div
                key={b.id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#1f1f1f] bg-[#121212] px-4 py-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#C9F31D] text-sm font-bold text-black">
                    {b.blocked.avatarUrl ? (
                      <img
                        src={b.blocked.avatarUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      getInitials(b.blocked.displayName)
                    )}
                  </div>

                  <div className="min-w-0">
                    <p className="truncate font-semibold text-white">
                      {b.blocked.displayName}
                    </p>
                    <p className="truncate text-sm text-[#888888]">
                      @{b.blocked.username}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => void handleUnblock(b.blocked.id)}
                  className="flex-shrink-0"
                  style={{
                    background: "transparent",
                    border: "1px solid #2a2a2a",
                    color: "#f0f0f0",
                    borderRadius: 20,
                    padding: "6px 16px",
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  Unblock
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

