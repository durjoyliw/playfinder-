/**
 * Beta mode.
 *
 * While PlayFinder is in beta, new people join with just a name (and date of
 * birth, for the 18+ gate) instead of a full sign-up form. Set
 * NEXT_PUBLIC_BETA_OPEN_JOIN=false in Vercel to switch back to the normal
 * username/email/password sign-up.
 */
export const BETA_OPEN_JOIN =
  process.env.NEXT_PUBLIC_BETA_OPEN_JOIN !== "false";

/** Where "create an account" links should point. */
export const JOIN_HREF = BETA_OPEN_JOIN ? "/join" : "/signup";

/**
 * During the beta everyone is in Glasgow: maps, venues and search are set up
 * for the city, so we don't ask people where they're based. Onboarding skips
 * the location step, the location settings are hidden, and the server stores
 * this city for everyone. Turning beta mode off brings the location step back.
 */
export const BETA_CITY: string | null = BETA_OPEN_JOIN ? "Glasgow" : null;
