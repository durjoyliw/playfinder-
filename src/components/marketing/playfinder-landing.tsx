import { MapPin, MessageCircle, Radio, Trophy } from "lucide-react";
import Link from "next/link";

const VOLT = "#C9F31D";
const BG = "#0d0d0d";
const CARD = "#161616";
const MUTED = "#a3a3a3";
const BORDER = "#2a2a2a";

const features = [
  {
    icon: Radio,
    title: "Broadcast a game instantly",
    description:
      "Need one more player? Post a broadcast and get responses in minutes.",
    photo: "https://picsum.photos/seed/playfinder-broadcast/640/960",
  },
  {
    icon: MapPin,
    title: "Find players near you",
    description:
      "Filter by sport and skill level. Find your match in seconds.",
    photo: null,
  },
  {
    icon: MessageCircle,
    title: "Chat and organise",
    description:
      "DM players directly and coordinate everything in one place.",
    photo: null,
  },
  {
    icon: Trophy,
    title: "Your athlete profile",
    description:
      "Your sports, skill levels, and what you're looking for. All in one place.",
    photo: "https://picsum.photos/seed/playfinder-trophy/640/480",
  },
] as const;

const steps = [
  {
    number: "1",
    title: "Create your profile",
    description: "Sign up in 30 seconds. Add your sports and area.",
  },
  {
    number: "2",
    title: "Browse the local feed",
    description: "Filter by sport and see who's looking to play near you.",
  },
  {
    number: "3",
    title: "Broadcast or join a game",
    description:
      "Post your own, or tap I'm in and DM to lock in the details.",
  },
] as const;

const avatarSeeds = [
  "playfinder-a",
  "playfinder-b",
  "playfinder-c",
  "playfinder-d",
];

function GoogleIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 256 262"
      aria-hidden
    >
      <path
        fill="#4285f4"
        d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622l38.755 30.023l2.685.268c24.659-22.774 38.875-56.282 38.875-96.027"
      />
      <path
        fill="#34a853"
        d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055c-34.523 0-63.824-22.773-74.269-54.25l-1.531.13l-40.298 31.187l-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1"
      />
      <path
        fill="#fbbc05"
        d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82c0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602z"
      />
      <path
        fill="#eb4335"
        d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0C79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251"
      />
    </svg>
  );
}

export function PlayFinderLanding() {
  return (
    <>
      <style>{`
        @keyframes pf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.85); }
        }
        @media (prefers-reduced-motion: no-preference) {
          .pf-pulse-dot { animation: pf-pulse 2.2s ease-in-out infinite; }
        }

        .pf-hero-grid { display: grid; grid-template-columns: 1fr 0.95fr; gap: 64px; align-items: center; }
        .pf-hero-photo { width: 100%; height: 460px; object-fit: cover; border-radius: 20px; display: block; border: 1px solid ${BORDER}; }
        .pf-hero-card { position: absolute; left: -28px; bottom: -28px; width: 300px; background: ${CARD}; border: 1px solid ${BORDER}; border-radius: 20px; padding: 18px; box-shadow: 0 20px 48px rgba(0,0,0,0.45); }

        .pf-features-grid { display: grid; grid-template-columns: 1.35fr 1fr; grid-template-rows: repeat(3, 1fr); gap: 16px; }
        .pf-feature-card--tall { grid-row: span 3; min-height: 480px; }

        .pf-steps-row { display: flex; align-items: flex-start; position: relative; }
        .pf-step { flex: 1; display: flex; flex-direction: column; align-items: center; text-align: center; padding: 0 28px; position: relative; }
        .pf-step:not(:first-child)::before { content: ''; position: absolute; top: 23px; left: -50%; width: 100%; height: 2px; background: ${BORDER}; z-index: 1; }
        .pf-step-circle { position: relative; z-index: 2; }

        .pf-testimonial-grid { display: grid; grid-template-columns: 0.9fr 1.1fr; gap: 56px; align-items: center; }
        .pf-testimonial-photo { width: 100%; height: 340px; object-fit: cover; border-radius: 20px; border: 1px solid ${BORDER}; }

        .pf-cta-band { display: flex; align-items: center; justify-content: space-between; gap: 40px; }
        .pf-footer-inner { display: flex; align-items: center; justify-content: space-between; gap: 24px; flex-wrap: wrap; }

        .pf-btn-primary:active, .pf-btn-google:active, .pf-signin:active { transform: scale(0.97); }
        .pf-btn-primary:focus-visible, .pf-btn-google:focus-visible, .pf-signin:focus-visible, .pf-mini-btn:focus-visible {
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
            backgroundColor: "rgba(13,13,13,0.88)",
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
              color: VOLT,
            }}
          >
            PlayFinder
          </span>
          <Link
            href="/login"
            className="pf-signin"
            style={{
              display: "inline-block",
              padding: "10px 22px",
              borderRadius: 9999,
              border: `1px solid ${VOLT}`,
              color: VOLT,
              fontSize: 14,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </nav>

        {/* Hero */}
        <section style={{ padding: "72px 56px 96px", maxWidth: 1352, margin: "0 auto" }}>
          <div className="pf-hero-grid">
            <div>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  padding: "7px 16px",
                  borderRadius: 9999,
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                  marginBottom: 28,
                  fontSize: 13,
                  color: MUTED,
                }}
              >
                <span
                  className="pf-pulse-dot"
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    backgroundColor: VOLT,
                    display: "inline-block",
                  }}
                />
                Live in Glasgow
              </div>

              <h1
                className="pf-h1"
                style={{
                  margin: 0,
                  fontSize: 52,
                  fontWeight: 800,
                  lineHeight: 1.1,
                  letterSpacing: "-0.02em",
                  color: "#ffffff",
                }}
              >
                Find your game.
                <br />
                <span
                  style={{
                    color: VOLT,
                    fontStyle: "italic",
                    display: "inline-block",
                    lineHeight: 1.15,
                    paddingBottom: 6,
                  }}
                >
                  Find your people.
                </span>
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
                The local sports network for Glasgow. Post a game, find
                players, and never miss a match.
              </p>

              <div style={{ display: "flex", gap: 14, marginTop: 36, flexWrap: "wrap" }}>
                <Link
                  href="/login"
                  className="pf-btn-primary"
                  style={{
                    padding: "15px 30px",
                    borderRadius: 9999,
                    backgroundColor: VOLT,
                    color: "#000000",
                    fontSize: 16,
                    fontWeight: 700,
                    textDecoration: "none",
                  }}
                >
                  Get started for free
                </Link>

                <Link
                  href="/login"
                  className="pf-btn-google"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "14px 26px",
                    borderRadius: 9999,
                    backgroundColor: CARD,
                    border: `1px solid ${BORDER}`,
                    color: "#ffffff",
                    fontSize: 15,
                    fontWeight: 600,
                    textDecoration: "none",
                  }}
                >
                  <GoogleIcon />
                  Continue with Google
                </Link>
              </div>
            </div>

            <div className="pf-hero-visual" style={{ position: "relative" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="pf-hero-photo"
                src="https://picsum.photos/seed/playfinder-five-a-side-glasgow/900/1100"
                alt="Players on a five-a-side football pitch at dusk"
              />
              <div className="pf-hero-card">
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: "50%",
                      backgroundImage:
                        "url(https://picsum.photos/seed/playfinder-fraser/80/80)",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: `1px solid ${BORDER}`,
                      flexShrink: 0,
                    }}
                  />
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ffffff" }}>
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
                  <span style={{ fontSize: 12, color: VOLT, fontWeight: 600 }}>
                    2 spots left
                  </span>
                  <button
                    type="button"
                    className="pf-mini-btn"
                    style={{
                      padding: "8px 16px",
                      borderRadius: 9999,
                      backgroundColor: VOLT,
                      color: "#000000",
                      fontSize: 12,
                      fontWeight: 700,
                      border: "none",
                    }}
                  >
                    I&apos;m in
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social proof */}
        <div style={{ padding: "0 56px 8px", maxWidth: 1352, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex" }}>
              {avatarSeeds.map((seed, i) => (
                <div
                  key={seed}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundImage: `url(https://picsum.photos/seed/${seed}/72/72)`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `2px solid ${BG}`,
                    marginLeft: i === 0 ? 0 : -12,
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: 14, color: MUTED }}>
              <strong style={{ color: "#ffffff" }}>312 players</strong>{" "}
              already active in Glasgow
            </span>
          </div>
        </div>

        {/* Features */}
        <section style={{ padding: "48px 56px 88px", maxWidth: 1352, margin: "0 auto" }}>
          <h2
            style={{
              fontFamily: "inherit",
              fontWeight: 700,
              fontSize: 28,
              margin: "0 0 32px",
              letterSpacing: "-0.01em",
              color: "#ffffff",
            }}
          >
            Everything you need to play more
          </h2>
          <div className="pf-features-grid">
            {features.map(({ icon: Icon, title, description, photo }, i) => (
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
                  minHeight: photo ? 220 : 160,
                }}
              >
                {photo && (
                  <>
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        backgroundImage: `url(${photo})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(13,13,13,0.15) 0%, rgba(13,13,13,0.92) 100%)",
                      }}
                    />
                  </>
                )}
                <Icon
                  size={22}
                  color={VOLT}
                  strokeWidth={2}
                  style={{ marginBottom: 14, position: "relative", zIndex: 1 }}
                />
                <h3
                  style={{
                    margin: "0 0 8px",
                    fontSize: 17,
                    fontWeight: 700,
                    color: "#ffffff",
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
                    color: photo ? "#d4d4d4" : MUTED,
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
        <section style={{ padding: "8px 56px 88px", maxWidth: 1352, margin: "0 auto" }}>
          <h2
            style={{
              fontWeight: 700,
              fontSize: 28,
              margin: "0 0 32px",
              letterSpacing: "-0.01em",
              color: "#ffffff",
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
                    color: "#000000",
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
                      color: "#ffffff",
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

        {/* Testimonial */}
        <section style={{ padding: "8px 56px 88px", maxWidth: 1352, margin: "0 auto" }}>
          <div className="pf-testimonial-grid">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="pf-testimonial-photo"
              src="https://picsum.photos/seed/playfinder-park-match/800/700"
              alt="Players warming up at a local Glasgow park before a match"
            />
            <div>
              <p
                style={{
                  fontSize: 24,
                  fontWeight: 500,
                  lineHeight: 1.4,
                  margin: "0 0 24px",
                  color: "#ffffff",
                }}
              >
                &quot;I posted a broadcast on a Tuesday night and had a full
                squad by Thursday. Beats scrolling through group chats.&quot;
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    backgroundImage:
                      "url(https://picsum.photos/seed/playfinder-boyle/72/72)",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    border: `1px solid ${BORDER}`,
                  }}
                />
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "#ffffff" }}>
                    Fraser Boyle
                  </div>
                  <div style={{ fontSize: 13, color: MUTED, marginTop: 2 }}>
                    Five-a-side captain, Partick
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ padding: "0 56px 64px", maxWidth: 1352, margin: "0 auto" }}>
          <div
            className="pf-cta-band"
            style={{
              padding: "64px 72px",
              borderRadius: 24,
              background: `radial-gradient(120% 140% at 20% 0%, rgba(201,243,29,0.12) 0%, rgba(22,22,22,0) 60%), ${CARD}`,
              border: `1px solid ${BORDER}`,
            }}
          >
            <div>
              <h2
                style={{
                  margin: "0 0 10px",
                  fontSize: 32,
                  fontWeight: 800,
                  color: "#ffffff",
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
                Join Glasgow&apos;s local sports network and find your next
                game today.
              </p>
            </div>
            <Link
              href="/login"
              className="pf-btn-primary"
              style={{
                padding: "15px 30px",
                borderRadius: 9999,
                backgroundColor: VOLT,
                color: "#000000",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Get started for free
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
          <div className="pf-footer-inner" style={{ maxWidth: 1352, margin: "0 auto" }}>
            <span
              style={{
                fontSize: 18,
                fontWeight: 700,
                fontStyle: "italic",
                color: VOLT,
              }}
            >
              PlayFinder
            </span>
            <div style={{ display: "flex", gap: 28 }}>
              <Link href="/privacy" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>
                Privacy
              </Link>
              <Link href="/terms" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>
                Terms
              </Link>
              <Link href="/contact" style={{ fontSize: 13, color: MUTED, textDecoration: "none" }}>
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
