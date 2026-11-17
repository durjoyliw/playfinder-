"use client";

import { CONSENT_CHANGE_EVENT, hasAnalyticsConsent } from "@/lib/consent";
import { Analytics } from "@vercel/analytics/react";
import { useEffect, useState } from "react";

/**
 * Vercel Analytics, loaded only after the visitor taps "Accept" on the cookie
 * banner (UK PECR). Rejecting — or never choosing — means nothing loads.
 * Enable "Web Analytics" for the project in the Vercel dashboard for data to
 * appear.
 */
export function ConsentedAnalytics() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(hasAnalyticsConsent());
    const onChange = () => setAllowed(hasAnalyticsConsent());
    window.addEventListener(CONSENT_CHANGE_EVENT, onChange);
    return () => window.removeEventListener(CONSENT_CHANGE_EVENT, onChange);
  }, []);

  return allowed ? <Analytics /> : null;
}
