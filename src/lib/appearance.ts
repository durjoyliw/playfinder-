/**
 * Appearance: two independent dials, applied as attributes on <html> and
 * resolved entirely by CSS variable presets in globals.css.
 *
 *   data-theme  -> background base (surfaces, borders, text)
 *   data-accent -> accent colour (--pf-volt + derived tokens, --pf-on-accent)
 *
 * Choices live in cookies so the root layout can render the right attributes
 * on the server (no flash of the wrong theme). Defaults are Noir + Volt,
 * i.e. exactly the original look.
 */

export const THEME_COOKIE = "pf_theme";
export const ACCENT_COOKIE = "pf_accent";
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export const THEMES = [
  { id: "noir", label: "Noir", bg: "#08090a", surface: "#131614", text: "#f2f5ef" },
  { id: "slate", label: "Slate", bg: "#2f353b", surface: "#3e464e", text: "#f1f3f5" },
  { id: "offwhite", label: "Off-white", bg: "#f8f9fa", surface: "#ffffff", text: "#14171a" },
  { id: "white", label: "White", bg: "#ffffff", surface: "#f1f3f5", text: "#111418" },
] as const;

export const ACCENTS = [
  { id: "volt", label: "Volt Green", color: "#a1c217", onAccent: "#0a0b0a" },
  { id: "optic", label: "Optic Yellow", color: "#e5f33d", onAccent: "#0a0b0a" },
  { id: "emerald", label: "Emerald", color: "#009b77", onAccent: "#0a0b0a" },
  { id: "crimson", label: "Crimson", color: "#dc143c", onAccent: "#ffffff" },
  { id: "coral", label: "Neon Coral", color: "#ff6f61", onAccent: "#0a0b0a" },
  { id: "cyan", label: "Electric Cyan", color: "#00e5ff", onAccent: "#0a0b0a" },
  { id: "orange", label: "Orange", color: "#ff7a00", onAccent: "#0a0b0a" },
] as const;

export type ThemeId = (typeof THEMES)[number]["id"];
export type AccentId = (typeof ACCENTS)[number]["id"];

export const DEFAULT_THEME: ThemeId = "noir";
export const DEFAULT_ACCENT: AccentId = "volt";

/** Unknown or missing cookie values fall back to the defaults. */
export function parseTheme(raw: string | undefined | null): ThemeId {
  return THEMES.some((t) => t.id === raw) ? (raw as ThemeId) : DEFAULT_THEME;
}

export function parseAccent(raw: string | undefined | null): AccentId {
  return ACCENTS.some((a) => a.id === raw) ? (raw as AccentId) : DEFAULT_ACCENT;
}

/** Applies a choice live and remembers it. Client-only. */
export function setAppearance(choice: { theme?: ThemeId; accent?: AccentId }) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  const write = (name: string, value: string) => {
    document.cookie = `${name}=${value}; Path=/; Max-Age=${ONE_YEAR_SECONDS}; SameSite=Lax${secure}`;
  };
  if (choice.theme) {
    root.dataset.theme = choice.theme;
    write(THEME_COOKIE, choice.theme);
  }
  if (choice.accent) {
    root.dataset.accent = choice.accent;
    write(ACCENT_COOKIE, choice.accent);
  }
}
