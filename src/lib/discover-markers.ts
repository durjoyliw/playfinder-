import type { MapMarker } from "@/components/discover/map-overlay-layout";
import type { Venue } from "@/lib/venues";

const VENUE_PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&h=400&fit=crop";

export function venueToMapMarker(venue: Venue, id: string): MapMarker {
  const primarySport = venue.sports[0] ?? "Sports";

  return {
    id,
    lng: venue.lng,
    lat: venue.lat,
    title: venue.name,
    sport: primarySport,
    venue: venue.sports.slice(0, 3).join(" · "),
    skillLevel: venue.sports.length > 1 ? "Multi-sport" : primarySport,
    organizer: {
      name: "PlayFinder",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      role: "Venue",
    },
    date: "Open for booking",
    location: venue.address,
    playersConfirmed: 0,
    playersNeeded: 0,
    image: VENUE_PLACEHOLDER_IMAGE,
    url: venue.url,
    sports: venue.sports,
    address: venue.address,
  };
}

export function venueMatchesSportFilter(
  venue: Venue,
  sportLabel: string | null,
): boolean {
  if (!sportLabel) return true;
  const needle = sportLabel.toLowerCase();
  return venue.sports.some((s) => s.toLowerCase().includes(needle));
}
