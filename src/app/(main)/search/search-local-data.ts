import {
  MOCK_CLUBS,
  MOCK_VENUES,
  type DiscoverPlace,
} from "@/lib/discover-places";

function matchesText(haystack: string | null | undefined, needle: string): boolean {
  if (!haystack) return false;
  return haystack.toLowerCase().includes(needle);
}

export function searchVenuesLocal(query: string): DiscoverPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return MOCK_VENUES.filter(
    (venue) =>
      matchesText(venue.name, q) ||
      matchesText(venue.address, q) ||
      (venue.sports ?? []).some((sport) => sport.toLowerCase().includes(q)),
  ).sort((a, b) => a.distanceMiles - b.distanceMiles);
}

export function searchClubsLocal(query: string): DiscoverPlace[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return MOCK_CLUBS.filter(
    (club) =>
      matchesText(club.name, q) ||
      matchesText(club.address, q) ||
      (club.sports ?? []).some((sport) =>
        sport.toLowerCase().includes(q),
      ),
  ).sort((a, b) => a.distanceMiles - b.distanceMiles);
}
