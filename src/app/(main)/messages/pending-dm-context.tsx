"use client";

import kyInstance from "@/lib/ky";
import { useRouter, useSearchParams } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useChatContext } from "stream-chat-react";

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
  const { client, setActiveChannel } = useChatContext();
  const [draft, setDraft] = useState<string | null>(null);

  const clearDraft = useCallback(() => setDraft(null), []);

  useEffect(() => {
    const to = searchParams.get("to");
    const draftParam = searchParams.get("draft");

    if (!to || !draftParam || !client.userID) return;

    let cancelled = false;

    async function openDm() {
      try {
        await kyInstance.post("/api/messages/prepare-dm", {
          json: { recipientId: to },
        });

        const channel = client.channel("messaging", {
          members: [client.userID!, to],
        });

        await channel.watch();

        if (!cancelled) {
          setActiveChannel(channel);
          setDraft(decodeURIComponent(draftParam));
          router.replace("/messages");
        }
      } catch (error) {
        console.error("Failed to open DM", error);
      }
    }

    openDm();

    return () => {
      cancelled = true;
    };
  }, [searchParams, client, setActiveChannel, router]);

  return (
    <PendingDmContext.Provider value={{ draft, clearDraft }}>
      {children}
    </PendingDmContext.Provider>
  );
}
