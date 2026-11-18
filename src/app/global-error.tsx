"use client";

/** The theme cookie, read directly: the app's providers aren't running. */
function isLightTheme(): boolean {
  if (typeof document === "undefined") return false;
  return /(?:^|;\s*)pf_theme=(white|offwhite)(?:;|$)/.test(document.cookie);
}

/**
 * Last-resort error page (the root layout itself failed), so it can't rely on
 * the app's CSS or fonts — plain inline styles only.
 */
export default function GlobalError({ reset }: { reset: () => void }) {
  const light = isLightTheme();
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100dvh",
          display: "grid",
          placeItems: "center",
          background: light ? "#ffffff" : "#08090a",
          color: light ? "#1c1e21" : "#f2f5ef",
          fontFamily: "system-ui, sans-serif",
          textAlign: "center",
          padding: 24,
        }}
      >
        <div>
          <h1 style={{ fontSize: 26, margin: "0 0 12px" }}>
            PlayFinder hit a snag
          </h1>
          <p
            style={{
              color: light ? "#65676b" : "#a3a3a3",
              margin: "0 0 24px",
              lineHeight: 1.5,
            }}
          >
            Something went wrong loading the app. Please try again.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              background: "#a1c217",
              color: "#0a0b0a",
              border: 0,
              borderRadius: 999,
              padding: "10px 24px",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
