export const dynamic = "force-static";
import type { MetadataRoute } from "next";

// PWA web manifest. Colours match the dark-first brand and the
// `viewport.themeColor` declared in layout.tsx (#0A0F1E). Icons resolve to the
// app icons (src/app/icon.png, apple-icon.png) Next.js exposes from /.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pickleball Central — Hyderabad",
    short_name: "Pickleball Central",
    description:
      "Hyderabad's premier pickleball facility. Book courts, join tournaments, and train with coaches.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0F1E",
    theme_color: "#0A0F1E",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
