// /summer-camp — dedicated, indexable landing page for the high-intent query
// "pickleball summer camp hyderabad".
//
// The query previously had no page to rank: the camp lived only as a homepage
// section (#summer-camp). This page reuses the existing <SummerCamp /> block as
// the hero, then adds unique supporting content (batches, what's included,
// enrolment steps, camp FAQs) so it is not a thin duplicate of the home section.
//
// JSON-LD: a `Course` schema (not Event) — a summer camp maps cleanly to a
// course and, crucially, does not require fabricated start/end dates. Provider
// links to the facility node (#facility) emitted on the homepage.

import { Icon } from "@/components/site/Icon";
import type { Metadata } from "next";
import Link from "next/link";

import { SummerCamp } from "@/components/landing/SummerCamp";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickleball-central.co.in";

const WA_NUMBER = "919700744634";
const WA_LINK = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(
  "Hi, I'd like to know more about Pickleball Central's Summer Camp.",
)}`;

export const metadata: Metadata = {
  title: "Pickleball Summer Camp in Hyderabad",
  description:
    "Pickleball summer camp in Peerzadiguda, Hyderabad — batches for all ages and levels. Certified coaches, equipment provided, daily match play. From ₹2,499.",
  alternates: { canonical: "/summer-camp" },
  openGraph: {
    title: "Pickleball Summer Camp in Hyderabad",
    description:
      "Hyderabad's pickleball summer camp at Pickleball Central, Peerzadiguda. All ages, all levels, certified coaches. From ₹2,499.",
    url: "/summer-camp",
    type: "website",
  },
};

const courseSchema = {
  "@context": "https://schema.org",
  "@type": "Course",
  name: "Pickleball Summer Camp",
  description:
    "Structured pickleball summer camp in Peerzadiguda, Hyderabad — batches for beginners, intermediate, and advanced players across all ages. Certified coaches, all equipment provided, daily match play and skill drills, small batches.",
  url: `${SITE_URL}/summer-camp`,
  provider: {
    "@type": "SportsActivityLocation",
    "@id": `${SITE_URL}/#facility`,
    name: "Pickleball Central",
    url: SITE_URL,
  },
  offers: {
    "@type": "Offer",
    price: "2499",
    priceCurrency: "INR",
    category: "Early bird",
  },
};

const BATCHES = [
  { level: "Beginners", note: "First paddle, first rallies — fundamentals and fun." },
  { level: "Intermediate", note: "Consistency, placement, and doubles positioning." },
  { level: "Advanced", note: "Tournament strokes, strategy, and match play." },
];

const INCLUDED = [
  "Certified coaches for every level",
  "All equipment provided — paddles and balls",
  "Daily match play + skill drills",
  "Small batches for personal attention",
];

const STEPS = [
  "Message us on WhatsApp or call to check the next batch dates and seat availability.",
  "Pick the batch that fits your age and level (beginner, intermediate, or advanced).",
  "Confirm your spot — early-bird pricing starts at ₹2,499 and seats are limited per batch.",
];

const CAMP_FAQS = [
  {
    q: "Who is the summer camp for?",
    a: "All ages and all levels. We run separate batches for beginners, intermediate, and advanced players, so first-timers and regular players each get the right coaching.",
  },
  {
    q: "Do I need my own paddle?",
    a: "No — paddles and balls are provided for every session. Just bring sports shoes, comfortable clothes, and a water bottle.",
  },
  {
    q: "How much does the camp cost?",
    a: "Early-bird pricing starts at ₹2,499. Seats are limited per batch, so the early-bird rate is best confirmed in advance on WhatsApp.",
  },
  {
    q: "Where is the camp held?",
    a: "At Pickleball Central in Peerzadiguda, Hyderabad — minutes from Uppal, Habsiguda, Nacharam, Boduppal, and Ghatkesar. On-site parking is available.",
  },
];

export default function SummerCampPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />

      {/* Hero — reuse the existing on-brand summer-camp section. */}
      <SummerCamp />

      {/* Unique supporting content (keeps this page distinct from the home section). */}
      <section className="relative bg-[#0A0F1E] py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          {/* Batches */}
          <h2
            className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Batches for every age &amp; level
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
            {BATCHES.map((b) => (
              <div
                key={b.level}
                className="rounded-2xl border border-[#2A3548] bg-[#111827]/60 p-6"
              >
                <h3 className="text-[#C8F400] font-bold uppercase tracking-wide mb-2">{b.level}</h3>
                <p className="text-sm text-[#CBD5E1] leading-relaxed">{b.note}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* What's included */}
            <div>
              <h2
                className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What&rsquo;s included
              </h2>
              <ul className="space-y-3">
                {INCLUDED.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span
                      className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8F400]"
                      aria-hidden="true"
                    />
                    <span className="text-sm text-[#CBD5E1]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* How to enrol */}
            <div>
              <h2
                className="text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-6"
                style={{ fontFamily: "var(--font-display)" }}
              >
                How to enrol
              </h2>
              <ol className="space-y-4">
                {STEPS.map((step, i) => (
                  <li key={step} className="flex items-start gap-4">
                    <span
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#C8F400] text-[#0A0F1E] text-sm font-bold"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm text-[#CBD5E1] leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C8F400] text-[#0A0F1E] text-sm font-bold uppercase tracking-[0.1em] hover:bg-[#D8FF20] transition-all"
                style={{ fontFamily: "var(--font-display)" }}
              >
                WhatsApp to Enroll
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Camp FAQs */}
          <h2
            className="mt-20 text-3xl md:text-4xl font-extrabold uppercase tracking-tight text-white mb-8"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Summer camp FAQs
          </h2>
          <div className="max-w-3xl space-y-4">
            {CAMP_FAQS.map((f) => (
              <details key={f.q} className="group border-b border-[#2A3548] pb-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-bold text-white [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <Icon name="arrow-down" className="h-4 w-4 shrink-0 text-[#C8F400] transition-transform group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{f.a}</p>
              </details>
            ))}
          </div>

          <p className="mt-12 text-sm text-[#94A3B8]">
            Looking for coaching outside the summer?{" "}
            <Link href="/coaching" className="text-[#C8F400] hover:underline">
              See our coaching programs
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
