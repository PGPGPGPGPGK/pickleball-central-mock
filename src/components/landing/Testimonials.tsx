// Testimonials — a masonry-style "review wall" of real Google reviews from
// Pickleball Central's GBP listing. Matches the aggregate in StructuredData.tsx.
//
// Mobile: shows the first 6 with a "See more" CTA to expand.
// Tablet/desktop: shows all reviews in a 2–3 column masonry layout.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

import { TESTIMONIALS } from "./testimonials-data";



const MOBILE_INITIAL = 6;

export function Testimonials() {
  const reducedMotion = useReducedMotion();
  const [expanded, setExpanded] = useState(false);

  return (
    <section
      aria-labelledby="testimonials-heading"
      className="relative py-24 md:py-32 bg-[#0A0F1E] overflow-hidden"
    >
      {/* Ambient volt glow */}
      <div
        aria-hidden="true"
        className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[400px] w-[800px] rounded-full bg-[#C8F400]/[0.04] blur-3xl"
      />

      <div className="relative max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12 md:mb-16">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-4">
            Player stories
          </span>
          <h2
            id="testimonials-heading"
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold uppercase tracking-tight leading-[0.95] text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            REAL PLAYERS.
            <br />
            <span className="text-[#C8F400]">REAL REVIEWS.</span>
          </h2>
          <p className="mt-4 text-[#94A3B8] text-base md:text-lg">
            {TESTIMONIALS.length}+ reviews, straight from our Google Business Profile — unfiltered.
          </p>
        </div>

        {/* Review wall — CSS columns give us a true masonry flow that
            hugs each review's intrinsic height. Mobile caps at MOBILE_INITIAL
            unless the user taps "See more". */}
        <div
          className={`columns-1 sm:columns-2 lg:columns-3 gap-5 md:gap-6 [column-fill:_balance] ${
            !expanded ? "max-sm:max-h-none" : ""
          }`}
        >
          {TESTIMONIALS.map((t, idx) => {
            const hiddenOnMobile = !expanded && idx >= MOBILE_INITIAL;
            return (
              <motion.figure
                key={t.id}
                initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.45, delay: Math.min(idx, 10) * 0.04 }}
                className={`group relative mb-5 md:mb-6 break-inside-avoid inline-block w-full rounded-2xl border border-[#2A3548] bg-[#111827] p-6 overflow-hidden hover:border-[#C8F400]/30 transition-colors ${
                  hiddenOnMobile ? "hidden sm:inline-block" : ""
                }`}
              >
                {/* Top gradient sheen */}
                <div
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8F400]/40 to-transparent"
                />
                {/* Quote mark */}
                <span
                  aria-hidden
                  className="absolute top-2 right-4 text-6xl text-[#C8F400]/15 leading-none font-serif"
                >
                  &ldquo;
                </span>

                <blockquote className="relative mb-5 text-[15px] text-[#CBD5E1] leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </blockquote>

                <figcaption className="flex items-center gap-3">
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#C8F400]/30 to-[#0D7377]/30 border border-[#2A3548] flex items-center justify-center">
                    <span
                      className="text-[11px] font-bold text-[#C8F400]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t.name
                        .split(" ")
                        .map((n) => n[0])
                        .filter(Boolean)
                        .slice(0, 2)
                        .join("")}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <p
                      className="text-sm font-bold uppercase tracking-tight text-white truncate"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {t.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
                      {t.handle}
                    </p>
                  </div>
                </figcaption>
              </motion.figure>
            );
          })}
        </div>

        {/* Mobile-only "See more" CTA */}
        {!expanded && TESTIMONIALS.length > MOBILE_INITIAL && (
          <div className="sm:hidden mt-2 flex justify-center">
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 rounded-full border border-[#C8F400]/40 bg-[#C8F400]/[0.06] px-6 py-3 text-xs font-bold uppercase tracking-[0.12em] text-[#C8F400] hover:bg-[#C8F400]/[0.12] transition-colors"
              style={{ fontFamily: "var(--font-display)" }}
            >
              See all {TESTIMONIALS.length} reviews
              <span aria-hidden>↓</span>
            </button>
          </div>
        )}

        {/* Aggregate footer */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-3 text-center">
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <svg
                key={i}
                className="h-5 w-5 text-[#C8F400]"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#94A3B8]">
            4.9 average · {TESTIMONIALS.length}+ reviews on Google
          </span>
        </div>
      </div>
    </section>
  );
}
