// Glass Pricing Card — inspired by EaseMize UI "Animated Glassy Pricing".
// A 3-tier pricing card with glass-morphism backdrop-blur, subtle border
// gradient, and scale-up-on-hover. Middle card gets a "most popular" lift.

"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";

export type PricingTier = {
  id: string;
  name: string;
  price: string; // e.g. "₹2,999" — pre-formatted
  priceUnit?: string; // e.g. "/month"
  description: string;
  features: string[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
  badge?: string;
};

export function GlassPricingCards({ tiers }: { tiers: PricingTier[] }) {
  const reducedMotion = useReducedMotion();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
      {tiers.map((tier, idx) => (
        <motion.div
          key={tier.id}
          initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: idx * 0.1 }}
          className={`relative ${tier.highlighted ? "md:-mt-4 md:mb-4" : ""}`}
        >
          {tier.highlighted && (
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-3xl bg-gradient-to-br from-[#C8F400]/20 via-transparent to-[#C8F400]/10 blur-2xl -z-10"
            />
          )}

          <div
            className={`relative h-full overflow-hidden rounded-3xl border p-8 backdrop-blur-xl transition-all duration-300 hover:scale-[1.02] ${
              tier.highlighted
                ? "border-[#C8F400]/40 bg-[#111827]/80 shadow-[0_0_60px_-20px_rgba(200,244,0,0.5)]"
                : "border-[#2A3548] bg-[#111827]/60 hover:border-[#C8F400]/20"
            }`}
          >
            {/* Top gradient sheen */}
            <div
              aria-hidden="true"
              className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C8F400]/40 to-transparent"
            />

            {tier.badge && (
              <span
                className="absolute top-6 right-6 rounded-full bg-[#C8F400] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0A0F1E]"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {tier.badge}
              </span>
            )}

            <h3
              className="mb-2 text-3xl font-bold uppercase tracking-tight text-white"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tier.name}
            </h3>
            <p className="mb-6 text-sm text-[#94A3B8]">{tier.description}</p>

            <div className="mb-6 flex items-baseline gap-1">
              <span
                className="text-5xl font-extrabold text-white"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {tier.price}
              </span>
              {tier.priceUnit && <span className="text-sm text-[#94A3B8]">{tier.priceUnit}</span>}
            </div>

            <ul className="mb-8 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2 text-sm text-[#CBD5E1]">
                  <Check />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href={tier.ctaHref}
              className={`block w-full rounded-xl px-6 py-3 text-center text-sm font-bold uppercase tracking-wider transition-colors ${
                tier.highlighted
                  ? "bg-[#C8F400] text-[#0A0F1E] hover:bg-[#D8FF20]"
                  : "border border-[#2A3548] text-white hover:border-[#C8F400]/40 hover:text-[#C8F400]"
              }`}
              style={{ fontFamily: "var(--font-display)" }}
            >
              {tier.ctaLabel}
            </Link>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function Check() {
  return (
    <svg
      className="mt-0.5 h-4 w-4 shrink-0 text-[#C8F400]"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
    </svg>
  );
}
