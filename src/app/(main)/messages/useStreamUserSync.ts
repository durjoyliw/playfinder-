"use client";

import kyInstance from "@/lib/ky";
import { useEffect } from "react";

const SYNC_STORAGE_KEY = "playfinder-stream-users-synced";

export function useStreamUserSync() {
  useEffect(() => {
    if (sessionStorage.getItem(SYNC_STORAGE_KEY)) return;

    kyInstance
      .post("/api/stream/sync-users")
      .then(() => {
        sessionStorage.setItem(SYNC_STORAGE_KEY, "1");
      })
      .catch((error) => {
        console.error("Failed to sync Stream users", error);
      });
  }, []);
}
