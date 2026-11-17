/**
 * Beta mode.
 *
 * While PlayFinder is in beta, new people join with just a name (and date of
 * birth, for the 18+ gate) instead of a full sign-up form. Set
 * NEXT_PUBLIC_BETA_OPEN_JOIN=false in Vercel to switch back to the normal
 * username/email/password sign-up.
 */
export const BETA_OPEN_JOIN = process.env.NEXT_PUBLIC_BETA_OPEN_JOIN !== "false";

/** Where "create an account" links should point. */
export const JOIN_HREF = BETA_OPEN_JOIN ? "/join" : "/signup";
