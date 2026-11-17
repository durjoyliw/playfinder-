import type { MetadataRoute } from "next";

/**
 * Web app manifest: lets people add PlayFinder to their Home Screen. On iOS
 * that is also what unlocks web push notifications.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PlayFinder",
    short_name: "PlayFinder",
    description: "Find players and games near you in Glasgow",
    start_url: "/home",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#08090a",
    theme_color: "#08090a",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
