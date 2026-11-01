// FAQ section.
//
// SEO-critical — Google surfaces FAQ rich results for local service
// queries. The FAQPage JSON-LD schema is emitted by StructuredData.tsx
// using this same FAQ_ITEMS array (exported below so both components
// share a single source of truth).
//
// Uses a custom AnimatePresence accordion instead of Radix Accordion to
// avoid adding a new dep. Keyboard-accessible: native <button> with
// aria-expanded + aria-controls for each panel.

"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

import { FAQ_ITEMS, type FaqItem } from "./faq-data";

export function Faq() {
  return (
    <section
      id="faq"
      aria-labelledby="faq-heading"
      className="relative py-24 md:py-32 bg-[#0A0F1E]"
    >
      <div className="max-w-4xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-4">
            FAQ
          </span>
          <h2
            id="faq-heading"
            className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            QUESTIONS?
            <br />
            <span className="text-[#C8F400]">WE&rsquo;VE GOT ANSWERS.</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQ_ITEMS.map((item, idx) => (
            <FaqRow key={item.q} idx={idx} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FaqRow({ idx, item }: { idx: number; item: FaqItem }) {
  const [open, setOpen] = useState(false);
  const panelId = `faq-panel-${idx}`;
  const buttonId = `faq-button-${idx}`;

  return (
    <div className="overflow-hidden rounded-2xl border border-[#2A3548] bg-[#111827]">
      <button
        id={buttonId}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left hover:bg-[#1C2535] transition-colors"
      >
        <span
          className="text-lg md:text-xl font-bold uppercase tracking-tight text-white"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {item.q}
        </span>
        <span
          className={`shrink-0 h-8 w-8 rounded-full border border-[#2A3548] flex items-center justify-center transition-all ${
            open ? "bg-[#C8F400] text-[#0A0F1E] border-[#C8F400]" : "text-[#C8F400]"
          }`}
          aria-hidden="true"
        >
          <svg
            className={`h-4 w-4 transition-transform ${open ? "rotate-45" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={buttonId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-5 text-[#CBD5E1] text-sm md:text-base leading-relaxed">
              {item.a}
              {"link" in item && item.link && (
                <div className="mt-3">
                  <Link
                    href={item.link.href}
                    className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.15em] text-[#C8F400] hover:gap-3 transition-all"
                  >
                    {item.link.label}
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
