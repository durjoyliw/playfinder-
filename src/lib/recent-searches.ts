const STORAGE_KEY = "playfinder-recent-searches";
const MAX_RECENT = 5;

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((t): t is string => typeof t === "string").slice(0, MAX_RECENT);
  } catch {
    return [];
  }
}

export function addRecentSearch(term: string) {
  const trimmed = term.trim();
  if (!trimmed || typeof window === "undefined") return;
  const prev = getRecentSearches().filter(
    (t) => t.toLowerCase() !== trimmed.toLowerCase(),
  );
  const next = [trimmed, ...prev].slice(0, MAX_RECENT);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}

export function removeRecentSearch(term: string) {
  if (typeof window === "undefined") return;
  const next = getRecentSearches().filter((t) => t !== term);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
}
