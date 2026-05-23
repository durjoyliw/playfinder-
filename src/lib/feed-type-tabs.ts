import { PostIntent } from "@prisma/client";
import { isLookingToPlayIntent } from "@/lib/playfinder";

export type FeedTypeTab = "players" | "teams" | "posts";

/** Posts tab uses BANTER — schema has no CASUAL/POST intent. */
export function postMatchesFeedTypeTab(
  intent: PostIntent | string,
  tab: FeedTypeTab,
): boolean {
  if (tab === "players") {
    return (
      isLookingToPlayIntent(intent) ||
      intent === PostIntent.RECRUITING ||
      String(intent) === "RECRUITING"
    );
  }

  if (tab === "teams") {
    return intent === PostIntent.RECRUITING || String(intent) === "RECRUITING";
  }

  return intent === PostIntent.BANTER || String(intent) === "BANTER";
}
