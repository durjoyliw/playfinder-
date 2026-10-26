"use client";

import { useRouter } from "next/navigation";
import { useCallback } from "react";

// True once the user has moved between routes inside the app this session.
// Module-level on purpose: it survives client navigations but resets on a full
// page load, which is exactly when `router.back()` could leave the app.
let hasNavigatedInApp = false;

export function markInAppNavigation() {
  hasNavigatedInApp = true;
}

/**
 * Back that never exits the app: goes back if there is in-app history,
 * otherwise navigates to `fallbackHref`.
 */
export function useSafeBack(fallbackHref = "/home") {
  const router = useRouter();
  return useCallback(() => {
    if (hasNavigatedInApp) router.back();
    else router.push(fallbackHref);
  }, [router, fallbackHref]);
}
