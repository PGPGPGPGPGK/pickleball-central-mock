// Summer Camp section.
//
// Content is real and on-brand, pulled from the summer-camp marketing
// posters supplied by the business. Pricing, batch size, and WhatsApp
// number match the flyers printed/shared in Peerzadiguda.
//
// Layout: left copy + CTA, right photo collage of 4 square posters.

import Image from "next/image";
import Link from "next/link";

const R2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

// Business WhatsApp number for summer camp enquiries (matches the posters)
const WA_ENQUIRY_NUMBER = "919700744634";
const WA_ENQUIRY_MESSAGE = encodeURIComponent(
  "Hi, I'd like to know more about Pickleball Central's Summer Camp for kids.",
);
const WA_LINK = `https://wa.me/${WA_ENQUIRY_NUMBER}?text=${WA_ENQUIRY_MESSAGE}`;

// 4 square posters (1:1 aspect) on R2 at pc-assets/images/summer-camp/
const POSTERS = [
  {
    src: "poster-3.jpg",
    alt: "Pickleball Summer Camp for Kids & Teens in Peerzadiguda, Hyderabad — summer shouldn\u2019t mean screens all day",
  },
  {
    src: "poster-1.jpg",
    alt: "Only 10 seats per batch — ₹2,499 early bird — Pickleball Central Summer Camp",
  },
  {
    src: "poster-2.jpg",
    alt: "Learn pickleball this summer — all ages, all levels — in Peerzadiguda",
  },
  {
    src: "poster-4.jpg",
    alt: "Hyderabad\u2019s first pickleball summer camp — batches open now — ₹2,499 onwards",
  },
];

// `detailsHref` — when set (homepage), renders a "Full details" link to the
// dedicated /summer-camp landing page. Omitted on that page itself to avoid a
// self-referencing link.
export function SummerCamp({ detailsHref }: { detailsHref?: string }) {
  return (
    <section
      id="summer-camp"
      aria-labelledby="summer-camp-heading"
      className="relative py-24 md:py-32 overflow-hidden"
    >
      {/* Subtle gradient accent background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#1C2535]/50 to-[#0A0F1E]"
      />
      <div
        aria-hidden="true"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[60%] w-[60%] rounded-full bg-[#C8F400]/5 blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left: copy */}
          <div className="lg:col-span-7">
            <span className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-4">
              Batches open now · All ages · All levels
            </span>
            <h2
              id="summer-camp-heading"
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[0.95] text-white mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              HYDERABAD&rsquo;S FIRST
              <br />
              <span className="text-[#C8F400]">PICKLEBALL</span>
              <br />
              SUMMER CAMP
            </h2>
            <p className="text-base md:text-lg text-[#CBD5E1] leading-relaxed max-w-2xl mb-8">
              Whether you&rsquo;re picking up a paddle for the first time, rallying every weekend,
              or sharpening tournament strokes &mdash; our summer camp is built for you. Structured
              batches for beginners, intermediate, and advanced players, at every age.
            </p>

            {/* Quick facts row — pulled from the posters */}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-10 max-w-2xl">
              {[
                { term: "From", def: "₹2,499", note: "Early bird" },
                { term: "Ages", def: "All", note: "Kids to adults" },
                { term: "Levels", def: "All", note: "Beginner · Inter · Pro" },
              ].map((fact) => (
                <div
                  key={fact.term}
                  className="rounded-xl border border-[#2A3548] bg-[#111827]/60 backdrop-blur-sm p-4"
                >
                  <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-[#94A3B8] mb-1">
                    {fact.term}
                  </dt>
                  <dd
                    className="font-extrabold text-2xl md:text-3xl text-[#C8F400] leading-none"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {fact.def}
                  </dd>
                  <dd className="font-mono text-[9px] uppercase tracking-wider text-[#94A3B8] mt-1">
                    {fact.note}
                  </dd>
                </div>
              ))}
            </dl>

            {/* Feature bullets */}
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-10">
              {[
                "Certified coaches for every level",
                "All equipment provided",
                "Daily match play + skill drills",
                "Small batches, personal attention",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8F400]"
                    aria-hidden="true"
                  />
                  <span className="text-sm text-[#CBD5E1]">{item}</span>
                </li>
              ))}
            </ul>

            {/* CTAs */}
            <div className="flex flex-wrap gap-4">
              <a
                href={WA_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[#C8F400] text-[#0A0F1E] text-sm font-bold uppercase tracking-[0.1em] hover:bg-[#D8FF20] transition-all shadow-[0_0_40px_-12px_rgba(200,244,0,0.5)]"
                style={{ fontFamily: "var(--font-display)" }}
              >
                WhatsApp to Enroll
                <span aria-hidden="true">→</span>
              </a>
              <a
                href="tel:+919700744634"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-xl border border-[#2A3548] text-white text-sm font-bold uppercase tracking-[0.1em] hover:border-[#C8F400]/40 hover:text-[#C8F400] transition-all"
                style={{ fontFamily: "var(--font-display)" }}
              >
                Call +91 97007 44634
              </a>
            </div>

            {detailsHref && (
              <Link
                href={detailsHref}
                className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-[#C8F400] hover:gap-3 transition-all"
              >
                Full summer camp details
                <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>

          {/* Right: poster collage — 2×2 grid of square posters */}
          <div className="lg:col-span-5">
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              {POSTERS.map((poster, idx) => (
                <div
                  key={poster.src}
                  className={`relative aspect-square rounded-2xl border border-[#2A3548] overflow-hidden bg-[#111827] ${
                    idx % 3 === 0 ? "translate-y-6" : ""
                  }`}
                >
                  {R2 ? (
                    <Image
                      src={`${R2}/images/summer-camp/${poster.src}`}
                      alt={poster.alt}
                      fill
                      sizes="(min-width: 1024px) 200px, 45vw"
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-[#C8F400]/15 to-transparent" />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
