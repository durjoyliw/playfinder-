"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useChatContext } from "stream-chat-react";
import { openOrRequestDm } from "./open-dm";

interface PendingDmContextValue {
  draft: string | null;
  clearDraft: () => void;
}

const PendingDmContext = createContext<PendingDmContextValue>({
  draft: null,
  clearDraft: () => {},
});

export function usePendingDmDraft() {
  return useContext(PendingDmContext);
}

export function PendingDmProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { client } = useChatContext();
  const [draft, setDraft] = useState<string | null>(null);
  const openedForRef = useRef<string | null>(null);

  const clearDraft = useCallback(() => setDraft(null), []);

  useEffect(() => {
    const to = searchParams.get("to");
    const draftParam = searchParams.get("draft");

    if (draftParam) {
      setDraft(draftParam);
    }

    if (!to) {
      openedForRef.current = null;
      return;
    }

    if (!client.userID) return;

    if (openedForRef.current === to) return;

    let cancelled = false;

    async function openDm() {
      try {
        const result = await openOrRequestDm({
          client,
          currentUserId: client.userID!,
          targetUserId: to!,
        });

        if (cancelled) return;

        if (result.type === "channel" && result.channel.id) {
          openedForRef.current = to;
          router.replace(
            `/messages/${encodeURIComponent(result.channel.id)}`,
          );
        } else if (result.type === "blocked") {
          openedForRef.current = to;
          router.replace("/messages");
        } else {
          console.error("Failed to open DM: unexpected result", result);
        }
      } catch (error) {
        console.error("Failed to open DM", error);
      }
    }

    void openDm();

    return () => {
      cancelled = true;
    };
  }, [searchParams, client, client.userID, router]);

  return (
    <PendingDmContext.Provider value={{ draft, clearDraft }}>
      {children}
    </PendingDmContext.Provider>
  );
}
