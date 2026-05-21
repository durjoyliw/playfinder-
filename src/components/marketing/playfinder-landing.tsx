import {
  MapPin,
  MessageCircle,
  Radio,
  Trophy,
} from "lucide-react";
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
  },
  {
    icon: MapPin,
    title: "Find players near you",
    description:
      "Filter by sport and skill level. Find your match in seconds.",
  },
  {
    icon: MessageCircle,
    title: "Chat and organise",
    description:
      "DM players directly and coordinate everything in one place.",
  },
  {
    icon: Trophy,
    title: "Your athlete profile",
    description:
      "Your sports, skill levels, and what you're looking for. All in one place.",
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
    description:
      "Filter by sport and see who's looking to play near you.",
  },
  {
    number: "3",
    title: "Broadcast or join a game",
    description: "Post your own or tap I'm in. DM to lock in the details.",
  },
] as const;

const avatars = ["MR", "SK", "JV", "RD"];

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
        .pf-pulse-dot {
          animation: pf-pulse 2s ease-in-out infinite;
        }
      `}</style>

      <div style={{ maxWidth: 480, margin: "0 auto", width: "100%" }}>
        {/* Nav */}
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "16px 20px",
            borderBottom: `1px solid ${BORDER}`,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              fontStyle: "italic",
              color: VOLT,
            }}
          >
            PlayFinder
          </span>
          <Link
            href="/login"
            style={{
              display: "inline-block",
              padding: "8px 18px",
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
        <section
          style={{
            padding: "48px 24px 40px",
            textAlign: "center",
            backgroundColor: BG,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "6px 14px",
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
            Now live in Glasgow
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 40,
              fontWeight: 800,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "#ffffff",
            }}
          >
            Find your game.
            <br />
            <span style={{ color: VOLT }}>Find your people.</span>
          </h1>

          <p
            style={{
              margin: "20px auto 0",
              maxWidth: 340,
              fontSize: 15,
              lineHeight: 1.6,
              color: MUTED,
            }}
          >
            The local sports network for Glasgow. Connect with players, post a
            game, and never miss a match again.
          </p>

          <div style={{ marginTop: 32 }}>
            <Link
              href="/login"
              style={{
                display: "block",
                width: "100%",
                maxWidth: 320,
                margin: "0 auto",
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: VOLT,
                color: "#000000",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              Get started — it&apos;s free
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              margin: "24px auto",
              maxWidth: 280,
              color: MUTED,
              fontSize: 13,
            }}
          >
            <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
            <span>or</span>
            <div style={{ flex: 1, height: 1, backgroundColor: BORDER }} />
          </div>

          <Link
            href="/login"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              width: "100%",
              maxWidth: 320,
              margin: "0 auto",
              padding: "13px 24px",
              borderRadius: 12,
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              marginTop: 32,
            }}
          >
            <div style={{ display: "flex", paddingLeft: 8 }}>
              {avatars.map((initials, i) => (
                <div
                  key={initials}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: CARD,
                    border: `2px solid ${BG}`,
                    marginLeft: i === 0 ? 0 : -10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: VOLT,
                  }}
                >
                  {initials}
                </div>
              ))}
            </div>
            <span style={{ fontSize: 13, color: MUTED, textAlign: "left" }}>
              200+ players already in Glasgow
            </span>
          </div>
        </section>

        {/* Features */}
        <section style={{ padding: "16px 20px 32px" }}>
          <p
            style={{
              margin: "0 0 16px 4px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            Why PlayFinder
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {features.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                style={{
                  padding: 20,
                  borderRadius: 16,
                  backgroundColor: CARD,
                  border: `1px solid ${BORDER}`,
                }}
              >
                <Icon
                  size={22}
                  color={VOLT}
                  strokeWidth={2}
                  style={{ marginBottom: 12 }}
                />
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
                  }}
                >
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section style={{ padding: "8px 20px 40px" }}>
          <p
            style={{
              margin: "0 0 20px 4px",
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: MUTED,
            }}
          >
            How it works
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {steps.map(({ number, title, description }) => (
              <div
                key={number}
                style={{ display: "flex", gap: 16, alignItems: "flex-start" }}
              >
                <div
                  style={{
                    flexShrink: 0,
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    backgroundColor: VOLT,
                    color: "#000000",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 16,
                    fontWeight: 800,
                  }}
                >
                  {number}
                </div>
                <div>
                  <h3
                    style={{
                      margin: "0 0 6px",
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
                    }}
                  >
                    {description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom CTA */}
        <section style={{ padding: "0 20px 32px" }}>
          <div
            style={{
              padding: 28,
              borderRadius: 16,
              backgroundColor: CARD,
              border: `1px solid ${BORDER}`,
              textAlign: "center",
            }}
          >
            <h2
              style={{
                margin: "0 0 10px",
                fontSize: 22,
                fontWeight: 800,
                color: "#ffffff",
              }}
            >
              Ready to play?
            </h2>
            <p
              style={{
                margin: "0 0 24px",
                fontSize: 14,
                lineHeight: 1.55,
                color: MUTED,
              }}
            >
              Join Glasgow&apos;s local sports network and find your next game
              today.
            </p>
            <Link
              href="/login"
              style={{
                display: "inline-block",
                width: "100%",
                padding: "14px 24px",
                borderRadius: 12,
                backgroundColor: VOLT,
                color: "#000000",
                fontSize: 16,
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Join PlayFinder free
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            padding: "24px 20px 40px",
            textAlign: "center",
            fontSize: 12,
            lineHeight: 1.6,
            color: MUTED,
            borderTop: `1px solid ${BORDER}`,
          }}
        >
          © 2026 PlayFinder · Glasgow Beta · Made for players, by players
        </footer>
      </div>
    </>
  );
}
