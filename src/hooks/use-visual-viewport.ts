"use client";

import { useEffect } from "react";

const VARS = ["--pf-vv-height", "--pf-vv-top", "--pf-vv-bottom-pad"] as const;

/**
 * Mirrors the visual viewport into CSS variables on <html> so a screen can
 * size itself to the area above the on-screen keyboard:
 *
 * - `--pf-vv-height`: visible height (shrinks when the iOS keyboard opens;
 *   `100dvh` does not)
 * - `--pf-vv-top`: how far Safari has scrolled the page to reveal the
 *   focused input -- a fixed element offsets by this to stay in view
 * - `--pf-vv-bottom-pad`: the home-indicator safe area, or 0 while the
 *   keyboard is open (the keyboard already covers that strip)
 */
export function useVisualViewportVars(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let frame = 0;

    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // A keyboard takes far more than browser chrome ever does.
        const keyboardOpen = window.innerHeight - viewport.height > 120;
        root.style.setProperty("--pf-vv-height", `${viewport.height}px`);
        root.style.setProperty("--pf-vv-top", `${viewport.offsetTop}px`);
        root.style.setProperty(
          "--pf-vv-bottom-pad",
          keyboardOpen ? "0px" : "env(safe-area-inset-bottom, 0px)",
        );
      });
    };

    update();
    viewport.addEventListener("resize", update);
    viewport.addEventListener("scroll", update);
    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("resize", update);
      viewport.removeEventListener("scroll", update);
      VARS.forEach((name) => root.style.removeProperty(name));
    };
  }, [enabled]);
}
