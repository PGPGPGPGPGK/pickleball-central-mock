// Bento Grid — adapted from Tailark Features 11 / Kokonut UI Bento Grid.
// Asymmetric responsive grid optimized for 6 feature cells.
//
// Accepts an array of cell configs: position determines grid-column-span /
// grid-row-span on desktop, stacks single-column on mobile.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { ReactNode } from "react";

export type BentoCell = {
  id: string;
  eyebrow?: string;
  title: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  /** Render the card as a plain <a> instead of next/link — for static
   *  pages in public/ (e.g. /season5) that aren't app routes. */
  external?: boolean;
  /** Desktop grid position — see spans map below */
  size: "small" | "medium" | "large" | "tall" | "wide";
  /** Optional custom visual overlay (photo, icon, illustration) */
  visual?: ReactNode;
  /** Tailwind gradient class for the background if no visual is supplied */
  gradient?: string;
};

// Desktop grid-span mapping. The parent grid is 4 cols × auto rows on lg+,
// single col on mobile. Each size class picks a col-span / row-span.
const SIZE_CLASSES: Record<BentoCell["size"], string> = {
  small: "lg:col-span-1 lg:row-span-1",
  medium: "lg:col-span-2 lg:row-span-1",
  large: "lg:col-span-2 lg:row-span-2",
  tall: "lg:col-span-1 lg:row-span-2",
  wide: "lg:col-span-3 lg:row-span-1",
};

export function BentoGrid({ cells }: { cells: BentoCell[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 md:auto-rows-[28rem] lg:auto-rows-[32rem] gap-4 md:gap-6">
      {cells.map((cell, idx) => (
        <motion.div
          key={cell.id}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, delay: idx * 0.06 }}
          className={SIZE_CLASSES[cell.size]}
        >
          <CardLink href={cell.ctaHref} external={cell.external ?? false}>
            {/* Background visual (photo slot or gradient fallback) */}
            {cell.visual ? (
              <div className="absolute inset-0">{cell.visual}</div>
            ) : (
              <div
                className={`absolute inset-0 ${cell.gradient ?? "bg-gradient-to-br from-[#1C2535] to-[#0A0F1E]"}`}
              />
            )}

            {/* Bottom-up legibility gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/70 to-transparent" />

            {/* Content */}
            <div className="relative flex h-full flex-col justify-end p-6 lg:p-8">
              {cell.eyebrow && (
                <span className="mb-2 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400]">
                  {cell.eyebrow}
                </span>
              )}
              <h3
                className="mb-2 text-2xl lg:text-3xl font-bold uppercase tracking-tight text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {cell.title}
              </h3>
              <p className="mb-4 max-w-md text-sm text-[#CBD5E1] leading-relaxed">
                {cell.description}
              </p>
              <span className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#C8F400] group-hover:gap-3 transition-all">
                {cell.ctaLabel}
                <span aria-hidden="true">→</span>
              </span>
            </div>

            {/* Hover border glow */}
            <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-[#C8F400]/0 transition-all duration-300 group-hover:ring-[#C8F400]/20 pointer-events-none" />
          </CardLink>
        </motion.div>
      ))}
    </div>
  );
}

// Card wrapper. Uses next/link for in-app routes, but a plain <a> for
// `external` cards so static pages in public/ (e.g. /season5) resolve
// to the real file instead of a client-routed 404.
const CARD_CLASS =
  "group relative block h-full min-h-[22rem] overflow-hidden rounded-2xl border border-[#2A3548] bg-[#111827] transition-all duration-300 hover:border-[#C8F400]/40 hover:shadow-[0_0_40px_-12px_rgba(200,244,0,0.35)]";

function CardLink({
  href,
  external,
  children,
}: {
  href: string;
  external?: boolean;
  children: ReactNode;
}) {
  if (external) {
    return (
      <a href={href} className={CARD_CLASS}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={CARD_CLASS}>
      {children}
    </Link>
  );
}
