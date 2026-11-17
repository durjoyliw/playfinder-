import {
  BroadcastArt,
  CityArt,
  PitchArt,
  ProfileArt,
} from "@/components/illustrations/playfinder-art";
import { HERO_PHOTO } from "@/lib/landing-photo";
import { JOIN_HREF } from "@/lib/beta";
import { MapPin, MessageCircle, Radio, Trophy } from "lucide-react";
import Link from "next/link";

const VOLT = "var(--pf-volt)";
const BG = "var(--pf-c-fill-0d0d0d)";
const CARD = "var(--pf-c-fill-161616)";
const MUTED = "var(--pf-c-ink-a3a3a3)";
const BORDER = "var(--pf-c-line-2a2a2a)";

const features = [
  {
    icon: Radio,
    title: "Broadcast a game instantly",
    description:
      "Need one more player? Post a broadcast and get responses in minutes.",
    Art: BroadcastArt,
  },
  {
    icon: MapPin,
    title: "Find players near you",
    description: "Filter by sport and skill level. Find your match in seconds.",
    Art: null,
  },
  {
    icon: MessageCircle,
    title: "Chat and organise",
    description: "DM players directly and coordinate everything in one place.",
    Art: null,
  },
  {
    icon: Trophy,
    title: "Your athlete profile",
    description:
      "Your sports, skill levels, and what you're looking for. All in one place.",
    Art: ProfileArt,
  },
] as const;

const steps = [
  {
    number: "1",
    title: "Tell us your name",
    description:
      "No email or password during the beta. Add your sports and area.",
  },
  {
    number: "2",
    title: "Browse the local feed",
    description: "Filter by sport and see who's looking to play near you.",
  },
  {
    number: "3",
    title: "Broadcast or join a game",
    description: "Post your own, or tap I'm in and DM to lock in the details.",
  },
] as const;

const betaFacts = ["Free during the beta", "Glasgow first", "18+"] as const;

export function PlayFinderLanding() {
  return (
    <>
      <style>{`
        @keyframes pf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: no-preference) {
        }

        .pf-hero-grid { display: grid; grid-template-columns: 1fr 0.95fr; gap: 64px; align-items: center; }
        .pf-hero-photo { width: 100%; height: 460px; border-radius: 20px; display: block; overflow: hidden; border: 1px solid ${BORDER}; }
        .pf-hero-card { position: absolute; left: -28px; bottom: -28px; width: 300px; background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 20px; padding: 18px; box-shadow: 0 20px 48px rgba(0,0,0,0.45); }

        .pf-features-grid { display: grid; grid-template-columns: 1.35fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 16px; }
        .pf-feature-card--tall { grid-row: span 3; min-height: 480px; }

        .pf-steps-row { display: flex; align-items: flex-start; position: relative; }
        .pf-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 28px; position: relative; }
        .pf-step:not(:first-child)::before { content: ''; position: absolute; top: 23px; left: -50%; width: 100%; height: 2px; background: ${BORDER}; z-index: 1; }
        .pf-step-circle { position: relative; z-index: 2; }

        .pf-testimonial-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center; }
        .pf-testimonial-photo { width: 100%; height: 340px; border-radius: 20px; overflow: hidden; border: 1px solid ${BORDER}; }

        .pf-cta-band { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .pf-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }

        .pf-btn-primary:active, .pf-btn-secondary:active, .pf-signin:active { transform: scale(0.97); }
        .pf-btn-primary:focus-visible, .pf-btn-secondary:focus-visible, .pf-signin:focus-visible, .pf-login-link:focus-visible {
          outline: 2px solid ${VOLT}; outline-offset: 2px;
        }

        @media (max-width: 860px) {
          .pf-nav-inner { padding-left: 20px !important; padding-right: 20px !important; }
          .pf-hero-grid { grid-template-columns: 1fr; gap: 40px; }
          .pf-hero-visual { order: -1; }
          .pf-hero-photo { height: 280px; }
          .pf-hero-card { position: static; width: 100%; margin-top: 16px; }
          .pf-h1 { font-size: 34px !important; }
          .pf-features-grid { grid-template-columns: 1fr; grid-template-rows: none; }
          .pf-feature-card--tall { grid-row: auto; min-height: 220px; }
          .pf-steps-row { flex-direction: column; gap: 28px; }
          .pf-step { flex-direction: row; text-align: left; padding: 0; align-items: flex-start; }
          .pf-step:not(:first-child)::before { display: none; }
          .pf-step-circle { margin-right: 16px !important; margin-bottom: 0 !important; }
          .pf-testimonial-grid { grid-template-columns: 1fr; gap: 28px; }
          .pf-testimonial-photo { height: 220px; }
          .pf-cta-band { flex-direction: column; align-items: flex-start; }
          .pf-footer-inner { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <div style={{ width: "100%", backgroundColor: BG }}>
        {/* Nav */}
        <nav
          className="pf-nav-inner"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 56px",
            borderBottom: `1px solid ${BORDER}`,
            position: "sticky",
            top: 0,
            backgroundColor: "rgb(var(--pf-c-fill-0d0d0d-rgb)/0.88)",
            backdropFilter: "blur(10px)",
            zIndex: 20,
          }}
        >
          <span
            style={{
              fontSize: 24,
              fontWeight: 700,
              fontStyle: "italic",
              lineHeight: 1.15,
              paddingBottom: 4,
              color: "var(--pf-volt-text)",
            }}
          >
            PlayFinder
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Link
              href="/login"
              className="pf-login-link"
              style={{
                color: MUTED,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Log in
            </Link>
            <Link
              href={JOIN_HREF}
              className="pf-signin"
              style={{
                display: "inline-block",
                padding: "10px 20px",
                borderRadius: 9999,
                border: `1px solid ${VOLT}`,
                color: "var(--pf-volt-text)",
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Join the beta
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <section
          style={{
            padding: "72px 56px 96px",
            maxWidth: 1352,
            margin: "0 auto",
          }}
        >
          <div className="pf-hero-grid">
            <div>
              <h1
                className="pf-h1"
                style={{
                  margin: 0,
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "var(--pf-c-ink-ffffff)",
                }}
              >
                Find a game in Glasgow tonight.
              </h1>

              <p
                style={{
                  margin: "24px 0 0",
                  maxWidth: 440,
                  fontSize: 17,
                  lineHeight: 1.6,
                  color: MUTED,
                }}
              >
                The local sports network for Glasgow. Post a game, find players,
                and never miss a match.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: 14,
                  marginTop: 36,
                  flexWrap: "wrap",
                }}
              >
                <Link
                  href={JOIN_HREF}
                  className="pf-btn-primary"
                  style={{
                    padding: "15px 30px",
                    borderRadius: 9999,
                    backgroundColor: VOLT,
                    color: "var(--pf-on-accent)",
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Join the beta — it&apos;s free
                </Link>

                <Link
                  href="/login"
                  className="pf-btn-secondary"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "14px 26px",
                    borderRadius: 9999,
                    backgroundColor: CARD,
                    border: `1px solid ${BORDER}`,
                    color: "var(--pf-c-ink-ffffff)",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  I have an account
                </Link>
              </div>
            </div>

            <div className="pf-hero-visual" style={{ position: "relative" }}>
              <div className="pf-hero-photo" style={{ backgroundColor: CARD }}>
                {HERO_PHOTO ? (
                  <img
                    src={HERO_PHOTO.src}
                    alt={HERO_PHOTO.alt}
                    className="h-full w-full object-cover"
                    fetchPriority="high"
                  />
                ) : (
                  <PitchArt
                    fit="contain"
                    className="h-full w-full"
                    title="A five-a-side pitch with two open spots waiting to be filled"
                  />
                )}
              </div>
              {HERO_PHOTO && (
                <p
                  style={{
                    margin: "8px 4px 0",
                    fontSize: 11,
                    color: MUTED,
                    textAlign: "right",
                  }}
                >
                  Photo:{" "}
                  <a
                    href={HERO_PHOTO.sourceUrl}
                    style={{ color: "inherit", textDecoration: "underline" }}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    {HERO_PHOTO.credit}
                  </a>{" "}
                  ({HERO_PHOTO.licence})
                </p>
              )}
              <div className="pf-hero-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    aria-hidden
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundColor: VOLT,
                      color: "var(--pf-on-accent)",
                      display: "grid",
                      placeItems: "center",
                      fontSize: 15,
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    F
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 700,
                        color: "var(--pf-c-ink-ffffff)",
                      }}
                    >
                      Fraser is broadcasting
                    </div>
                    <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>
                      5-a-side, Kelvingrove Park · Tonight, 7pm
                    </div>
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginTop: 14,
                    paddingTop: 14,
                    borderTop: `1px solid ${BORDER}`,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: "var(--pf-volt-text)",
                      fontWeight: 600,
                    }}
                  >
                    2 spots left
                  </span>
                  <span
                    aria-hidden
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9999,
                      backgroundColor: VOLT,
                      color: "var(--pf-on-accent)",
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                    }}
                  >
                    I&apos;m in
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Beta facts */}
        <div
          style={{ padding: "0 56px 8px", maxWidth: 1352, margin: "0 auto" }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {betaFacts.map((fact) => (
              <span
                key={fact}
                style={{
                  padding: "7px 14px",
                  borderRadius: 9999,
                  border: `1px solid ${BORDER}`,
                  backgroundColor: CARD,
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                {fact}
              </span>
            ))}
          </div>
        </div>

        {/* Features */}
        <section
          style={{
            padding: "48px 56px 88px",
            maxWidth: 1352,
            margin: "0 auto",
          }}
        >
          <h2
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 28,
              margin: "0 0 32px",
              letterSpacing: "-0.01em",
              color: "var(--pf-c-ink-ffffff)",
            }}
          >
            Everything you need to play more
          </h2>
          <div className="pf-features-grid">
            {features.map(({ icon: Icon, title, description, Art }, i) => (
              <div
                key={title}
                className={i === 0 ? "pf-feature-card--tall" : undefined}
                style={{
                  padding: 26,
                  borderRadius: 20,
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  position: "relative",
                  overflow: "hidden",
                  minHeight: Art ? 220 : 160,
                }}
              >
                {Art && (
                  // The illustration gets its own band at the top of the card,
                  // so it never sits behind the copy.
                  <div
                    style={{
                      position: "relative",
                      flex: 1,
                      minHeight: i === 0 ? 240 : 150,
                      margin: "-26px -26px 22px",
                      overflow: "hidden",
                      borderBottom: `1px solid ${BORDER}`,
                    }}
                  >
                    <Art className="absolute inset-0 h-full w-full" />
                  </div>
                )}
                <Icon
                  size={22}
                  // SVG stroke attributes can't take var(); colour via CSS instead.
                  color="currentColor"
                  strokeWidth={2}
                  style={{
                    marginBottom: 14,
                    position: "relative",
                    zIndex: 1,
                    color: "var(--pf-volt-text)",
                  }}
                />
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "var(--pf-c-ink-ffffff)",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  {title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14,
                    lineHeight: 1.55,
                    color: MUTED,
                    position: "relative",
                    zIndex: 1,
                    maxWidth: 360,
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section
          style={{ padding: "8px 56px 88px", maxWidth: 1352, margin: "0 auto" }}
        >
          <h2
            style={{
              fontWeight: 700,
              fontSize: 28,
              margin: "0 0 32px",
              letterSpacing: "-0.01em",
              color: "var(--pf-c-ink-ffffff)",
            }}
          >
            How it works
          </h2>
          <div className="pf-steps-row">
            {steps.map(({ number, title, description }) => (
              <div key={number} className="pf-step">
                <div
                  className="pf-step-circle"
                  style={{
                    width: 46,
                    height: 46,
                    borderRadius: "50%",
                    backgroundColor: VOLT,
                    color: "var(--pf-on-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 17,
                    marginBottom: 22,
                    flexShrink: 0,
                  }}
                >
                  {number}
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 8px",
                      fontSize: 16,
                      fontWeight: 700,
                      color: "var(--pf-c-ink-ffffff)",
                    }}
                  >
                    {title}
                  </h3>
                  <p
                    style={{
                      margin: 0,
                      fontSize: 14,
                      lineHeight: 1.55,
                      color: MUTED,
                      maxWidth: 240,
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Built in Glasgow */}
        <section
          style={{ padding: "8px 56px 88px", maxWidth: 1352, margin: "0 auto" }}
        >
          <div className="pf-testimonial-grid">
            <div
              className="pf-testimonial-photo"
              style={{ backgroundColor: CARD }}
            >
              <CityArt
                className="h-full w-full"
                title="Map of Glasgow with pins in Partick, the West End, Dennistoun, Govan and the Southside"
              />
            </div>
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  margin: "0 0 18px",
                  color: "var(--pf-c-ink-ffffff)",
                }}
              >
                Made by a five-a-side player who got tired of group chats dying
                the week before kick-off.
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.6,
                  color: MUTED,
                  maxWidth: 460,
                }}
              >
                PlayFinder is in beta. Some things will be rough — when you spot
                one, send feedback from the app menu and it gets fixed.
              </p>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section
          style={{ padding: "0 56px 64px", maxWidth: 1352, margin: "0 auto" }}
        >
          <div
            className="pf-cta-band"
            style={{
              padding: "64px 72px",
              borderRadius: 24,
              background: `radial-gradient(120% 140% at 20% 0%, rgb(var(--pf-volt-rgb)/0.12) 0%, rgb(var(--pf-c-fill-161616-rgb)/0) 60%), ${CARD}`,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "var(--pf-c-ink-ffffff)",
                }}
              >
                Ready to play?
              </h2>
              <p
                style={{
                  margin: 0,
                  fontSize: 15,
                  lineHeight: 1.55,
                  color: MUTED,
                  maxWidth: 420,
                }}
              >
                Join the beta and help shape Glasgow&apos;s local sports
                network. Free while we&apos;re testing.
              </p>
            </div>
            <Link
              href={JOIN_HREF}
              className="pf-btn-primary"
              style={{
                padding: "15px 30px",
                borderRadius: 9999,
                backgroundColor: VOLT,
                color: "var(--pf-on-accent)",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Join the beta
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "40px 56px",
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          <div
            className="pf-footer-inner"
            style={{ maxWidth: 1352, margin: "0 auto" }}
          >
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontStyle: "italic",
                color: "var(--pf-volt-text)",
              }}
            >
              PlayFinder
            </span>
            <div style={{ display: "flex", gap: 28 }}>
              <Link
                href="/privacy"
                style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}
              >
                Privacy
              </Link>
              <Link
                href="/terms"
                style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}
              >
                Terms
              </Link>
              <Link
                href="/cookies"
                style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}
              >
                Cookies
              </Link>
              <Link
                href="/contact"
                style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}
              >
                Contact
              </Link>
            </div>
            <span style={{ fontSize: 13, color: MUTED }}>
              © 2026 PlayFinder. Made for players, in Glasgow.
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
