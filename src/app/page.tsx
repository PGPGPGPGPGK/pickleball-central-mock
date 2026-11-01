// Pickleball Central — home.
//
// One screen of hero, then the short way into everything else: an activity
// menu, the next tournament (live from the events API), the venue, and the
// FAQ (kept because the homepage's FAQ JSON-LD must match on-page content).
// Each activity has its own page now — the old 17-section scroll is retired.

import type { Metadata } from "next";

import { Faq } from "@/components/landing/Faq";
import { StructuredData } from "@/components/landing/StructuredData";
import { HomeSections } from "@/components/site/HomeSections";
import { HomeHero } from "@/components/site/HomeHero";
import { fetchPublicEvents } from "@/lib/api";
import { istToday } from "@/lib/format";
import { splitEvents } from "@/lib/tournaments";

// Revalidate every 60s so dynamic sections stay reasonably fresh
// without re-rendering on every request.
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Pickleball Central — Hyderabad’s Premier Pickleball Facility",
  description:
    "Book pro pickleball courts in Peerzadiguda, Hyderabad. Join tournaments, train with certified coaches, and play daily at our 4-court club with on-site café.",
  keywords: [
    "pickleball hyderabad",
    "pickleball peerzadiguda",
    "pickleball court booking hyderabad",
    "pickleball coaching hyderabad",
    "pickleball tournaments hyderabad",
    "pickleball central",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    title: "Pickleball Central — Peerzadiguda, Hyderabad",
    description:
      "Book courts, join tournaments, train with pros. Hyderabad’s premier pickleball facility in Peerzadiguda with on-site café and nail studio.",
    url: "/",
    type: "website",
  },
};

export default async function LandingPage() {
  const today = istToday();
  const { upcoming } = splitEvents(await fetchPublicEvents(), today);
  return (
    <>
      <StructuredData />
      <HomeHero />
      <HomeSections next={upcoming[0] ?? null} today={today} />
      <Faq />
    </>
  );
}
