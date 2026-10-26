import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { Toaster } from "@/components/ui/toaster";
import {
  ACCENT_COOKIE,
  THEME_COOKIE,
  parseAccent,
  parseTheme,
} from "@/lib/appearance";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { ThemeProvider } from "next-themes";
import { DM_Mono, Space_Grotesk } from "next/font/google";
import localFont from "next/font/local";
import { extractRouterConfig } from "uploadthing/server";
import { fileRouter } from "./api/uploadthing/core";
import "./globals.css";
import ReactQueryProvider from "./ReactQueryProvider";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
});
const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-dm-mono",
});

export const metadata: Metadata = {
  title: {
    template: "%s | PlayFinder",
    default: "PlayFinder",
  },
  description: "Find players and games near you",
};

// `viewport-fit=cover` lets iOS report real safe-area insets, so the
// env(safe-area-inset-*) padding on the header, bottom nav and drawer works.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Appearance is rendered server-side from cookies so the first paint is
  // already in the chosen theme (no flash). Defaults = Noir + Volt.
  const cookieStore = cookies();
  const theme = parseTheme(cookieStore.get(THEME_COOKIE)?.value);
  const accent = parseAccent(cookieStore.get(ACCENT_COOKIE)?.value);

  return (
    <html lang="en" data-theme={theme} data-accent={accent}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} ${dmMono.variable} font-grotesk antialiased`}
      >
        <NextSSRPlugin routerConfig={extractRouterConfig(fileRouter)} />
        <ReactQueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </ReactQueryProvider>
        <Toaster />
        <CookieConsentBanner />
      </body>
    </html>
  );
}
