"use client";

import { isLightTheme } from "@/lib/appearance";
import { useEffect, useState } from "react";

function readIsLight() {
  if (typeof document === "undefined") return false;
  return isLightTheme(document.documentElement.dataset.theme);
}

/**
 * True while a light background base (Off-white / White) is active. Follows
 * live changes from Settings -> Appearance (it watches `data-theme` on
 * <html>). For third-party widgets that need their own light/dark mode
 * (Stream Chat theme, Mapbox style) rather than our CSS variables.
 */
export function useIsLightBase() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    setIsLight(readIsLight());
    const observer = new MutationObserver(() => setIsLight(readIsLight()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
    return () => observer.disconnect();
  }, []);

  return isLight;
}

/** Synchronous read for one-off setup (e.g. a map's initial style). */
export { readIsLight };
