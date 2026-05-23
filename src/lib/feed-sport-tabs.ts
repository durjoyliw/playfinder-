import {
  getSportDisplay,
  normalizeSportKey,
} from "@/lib/onboarding-sports";

export interface FeedSportTab {
  id: string;
  label: string;
}

/** Build feed filter tabs: All first, then user's onboarding sports in saved order. */
export function buildFeedSportTabs(userSportKeys: string[]): FeedSportTab[] {
  const tabs: FeedSportTab[] = [{ id: "all", label: "All" }];
  const seen = new Set<string>();

  for (const raw of userSportKeys) {
    const id = normalizeSportKey(raw);
    if (seen.has(id)) continue;
    seen.add(id);
    const { name } = getSportDisplay(raw);
    tabs.push({ id, label: name });
  }

  return tabs;
}
