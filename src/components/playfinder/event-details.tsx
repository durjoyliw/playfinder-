"use client";

import {
  ArrowLeft,
  Share2,
  Heart,
  MapPin,
  Clock,
  Users,
  Star,
  Calendar,
  MessageCircle,
  ChevronRight,
} from "lucide-react";

interface EventDetailsProps {
  onBack?: () => void;
}

export function EventDetails({ onBack }: EventDetailsProps) {
  const playerSlots = [
    { filled: true, name: "Marcus R.", avatar: "MR" },
    { filled: true, name: "Jamie K.", avatar: "JK" },
    { filled: true, name: "Alex M.", avatar: "AM" },
    { filled: true, name: "Chris T.", avatar: "CT" },
    { filled: false, name: "Open Spot", avatar: null },
  ];

  return (
    <div className="min-h-screen bg-[var(--pf-c-fill-0d0d0d)]">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-[rgb(var(--pf-c-fill-0d0d0d-rgb)/0.95)] px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="-ml-2 rounded-full p-2 transition-colors hover:bg-[var(--pf-c-fill-1f1f1f)]"
          >
            <ArrowLeft className="h-5 w-5 text-[var(--pf-c-ink-ffffff)]" />
          </button>

          <h1 className="font-semibold text-[var(--pf-c-ink-ffffff)]">
            Event Details
          </h1>

          <div className="flex items-center gap-1">
            <button className="rounded-full p-2 transition-colors hover:bg-[var(--pf-c-fill-1f1f1f)]">
              <Heart className="h-5 w-5 text-muted-foreground" />
            </button>
            <button className="rounded-full p-2 transition-colors hover:bg-[var(--pf-c-fill-1f1f1f)]">
              <Share2 className="h-5 w-5 text-muted-foreground" />
            </button>
          </div>
        </div>
      </header>

      <div className="pb-32">
        {/* Hero Section */}
        <div className="relative">
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[var(--pf-c-fill-1a1a1a)] to-[var(--pf-c-fill-0d0d0d)]">
            {/* Football field pattern overlay */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute inset-0 m-4 rounded border-2 border-[rgb(var(--pf-contrast-rgb)/0.2)]" />
              <div className="absolute bottom-0 left-1/2 top-0 w-0.5 -translate-x-1/2 bg-[rgb(var(--pf-contrast-rgb)/0.2)]" />
              <div className="absolute left-1/2 top-1/2 h-16 w-16 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[rgb(var(--pf-contrast-rgb)/0.2)]" />
            </div>

            {/* Sport icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl opacity-30">⚽</span>
            </div>
          </div>

          {/* Status badge */}
          <div className="absolute bottom-4 left-4">
            <span className="rounded-full bg-[var(--pf-volt)] px-3 py-1 text-xs font-bold text-[var(--pf-on-accent)]">
              Filling fast
            </span>
          </div>

          {/* Expiry timer */}
          <div className="absolute bottom-4 right-4">
            <div className="flex items-center gap-2 rounded-full bg-black/60 px-3 py-1 backdrop-blur-sm">
              <Clock className="h-3.5 w-3.5 text-[var(--pf-volt-text)]" />
              <span className="text-xs font-medium text-[var(--pf-c-ink-ffffff)]">
                3h 25m left
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 pt-4">
          {/* Title & Host */}
          <div className="mb-4 flex items-start gap-3">
            <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[var(--pf-c-fill-2a2a2a)] text-sm font-bold text-[var(--pf-c-ink-ffffff)]">
              MR
            </div>
            <div className="flex-1">
              <h2 className="mb-1 text-xl font-bold text-[var(--pf-c-ink-ffffff)]">
                5 a Side Football
              </h2>
              <p className="text-sm text-muted-foreground">
                Hosted by{" "}
                <span className="text-[var(--pf-c-ink-ffffff)]">
                  Marcus Reid
                </span>
              </p>
            </div>
          </div>

          {/* Quick Info Cards */}
          <div className="mb-6 grid grid-cols-2 gap-3">
            <div className="pf-card rounded-xl bg-[var(--pf-c-fill-1a1a1a)] p-3">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span className="text-xs">When</span>
              </div>
              <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                Tonight
              </p>
              <p className="text-sm text-muted-foreground">7:00 PM</p>
            </div>

            <div className="pf-card rounded-xl bg-[var(--pf-c-fill-1a1a1a)] p-3">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span className="text-xs">Where</span>
              </div>
              <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                Glasgow Green
              </p>
              <p className="text-sm text-muted-foreground">Football Centre</p>
            </div>

            <div className="pf-card rounded-xl bg-[var(--pf-c-fill-1a1a1a)] p-3">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Users className="h-4 w-4" />
                <span className="text-xs">Spots</span>
              </div>
              <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                1 of 5
              </p>
              <p className="text-sm text-[var(--pf-volt-text)]">1 spot left</p>
            </div>

            <div className="pf-card rounded-xl bg-[var(--pf-c-fill-1a1a1a)] p-3">
              <div className="mb-1 flex items-center gap-2 text-muted-foreground">
                <Star className="h-4 w-4" />
                <span className="text-xs">Level</span>
              </div>
              <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                All Levels
              </p>
              <p className="text-sm text-muted-foreground">Casual game</p>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="mb-2 font-semibold text-[var(--pf-c-ink-ffffff)]">
              About this game
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Need 1 more for 5 a side tonight at 7 PM. Glasgow Green Football
              Centre. All levels welcome, just bring good vibes. We usually play
              for about an hour, nice and relaxed. Bring water and wear astro
              boots if you have them.
            </p>
          </div>

          {/* Player Slots */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                Players ({playerSlots.filter((s) => s.filled).length}/
                {playerSlots.length})
              </h3>
              <button className="flex items-center gap-1 text-sm font-medium text-[var(--pf-volt-text)]">
                View all <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            <div className="scrollbar-hide flex gap-3 overflow-x-auto pb-2">
              {playerSlots.map((slot, i) => (
                <div
                  key={i}
                  className="flex flex-shrink-0 flex-col items-center gap-2"
                >
                  <div
                    className={`flex h-14 w-14 items-center justify-center rounded-full text-sm font-bold transition-all ${
                      slot.filled
                        ? "border-2 border-[var(--pf-volt)] bg-[var(--pf-c-fill-2a2a2a)] text-[var(--pf-c-ink-ffffff)]"
                        : "border-2 border-dashed border-muted-foreground bg-transparent"
                    } `}
                  >
                    {slot.filled ? (
                      slot.avatar
                    ) : (
                      <span className="text-2xl text-muted-foreground">+</span>
                    )}
                  </div>
                  <span
                    className={`text-xs ${slot.filled ? "text-[var(--pf-c-ink-ffffff)]" : "text-muted-foreground"}`}
                  >
                    {slot.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Location Map Placeholder */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-[var(--pf-c-ink-ffffff)]">
              Location
            </h3>
            <div className="pf-card overflow-hidden rounded-xl bg-[var(--pf-c-fill-1a1a1a)]">
              <div className="relative flex h-32 items-center justify-center bg-[var(--pf-c-fill-1f1f1f)]">
                <div className="text-center">
                  <MapPin className="mx-auto mb-2 h-8 w-8 text-[var(--pf-volt-text)]" />
                  <p className="text-sm text-muted-foreground">
                    Glasgow Green Football Centre
                  </p>
                </div>
              </div>
              <button className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-[var(--pf-volt-text)] transition-colors hover:bg-[var(--pf-c-fill-1f1f1f)]">
                <MapPin className="h-4 w-4" />
                Get Directions
              </button>
            </div>
          </div>

          {/* Host Info */}
          <div className="mb-6">
            <h3 className="mb-3 font-semibold text-[var(--pf-c-ink-ffffff)]">
              About the host
            </h3>
            <div className="pf-card rounded-xl bg-[var(--pf-c-fill-1a1a1a)] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--pf-c-fill-2a2a2a)] font-bold text-[var(--pf-c-ink-ffffff)]">
                  MR
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
                    Marcus Reid
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>⚽ 24 games hosted</span>
                    <span>⭐ 4.8 rating</span>
                  </div>
                </div>
                <button className="rounded-full p-2 transition-colors hover:bg-[var(--pf-c-fill-2a2a2a)]">
                  <MessageCircle className="h-5 w-5 text-muted-foreground" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Bottom CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-[var(--pf-c-fill-0d0d0d)] p-4 pb-8">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <p className="font-semibold text-[var(--pf-c-ink-ffffff)]">
              1 spot left
            </p>
            <p className="text-sm text-muted-foreground">Expires in 3h 25m</p>
          </div>
          <button className="rounded-full bg-[var(--pf-volt)] px-8 py-3 text-base font-bold text-[var(--pf-on-accent)] transition-all hover:bg-[var(--pf-volt-hover)] active:scale-95">
            👋 {"I'm In"}
          </button>
        </div>
      </div>
    </div>
  );
}
