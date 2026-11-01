import type { Metadata } from "next";

import { PlanColumns } from "@/components/membership/PlanColumns";
import { Icon } from "@/components/site/Icon";
import { PageIntro } from "@/components/site/ui";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Membership Plans",
  description:
    "One Pickleball Central membership, four ways to pay: ₹2,500 monthly, ₹6,000 quarterly, ₹10,000 half-yearly, or ₹18,000 for the year — down to ₹1,500 a month. Peerzadiguda, Hyderabad.",
  alternates: { canonical: "/membership" },
  openGraph: {
    title: "Membership — Pickleball Central Peerzadiguda",
    description:
      "One membership, four commitment lengths. From ₹2,500 a month, down to ₹1,500 a month on the yearly plan. Hyderabad’s premier pickleball facility.",
    url: "/membership",
    type: "website",
  },
};

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is the difference between the four plans?",
    a: "Mainly the commitment length and the price — every plan includes the same 30 free playing hours a month, and paying for a longer stretch up front costs less per month, from ₹2,500 monthly down to ₹1,500 a month on the yearly plan. The longer terms also carry a bigger discount on additional booking hours and F&B, and more guest passes.",
  },
  {
    q: "Is there a lock-in period?",
    a: "The monthly plan is month-to-month with no lock-in — cancel any time before your next billing date. The quarterly, half-yearly and yearly plans are prepaid for their full term, which is what earns the lower rate.",
  },
  {
    q: "Can I switch to a longer plan later?",
    a: "Yes. Talk to us at reception or on WhatsApp and we will move you across — the unused portion of your current term is adjusted against the new one.",
  },
  {
    q: "What happens if my membership lapses?",
    a: "You get a 3-day grace period. After that, you revert to standard walk-in rates. Rejoin anytime to resume your member benefits.",
  },
  {
    q: "Are the prices inclusive of GST?",
    a: "Yes. Every price shown includes 18% GST — the amount on the card is the amount you pay.",
  },
];

export default function MembershipPage() {
  return (
    <>
      <PageIntro
        title={
          <>
            Join the club. <span className="text-[#C8F400]">Play more.</span>
          </>
        }
        lede="One membership, four ways to pay for it. The longer you commit, the less each month costs: from ₹2,500 monthly down to ₹1,500 a month on the yearly plan. All prices include 18% GST."
      />
      <div className="mx-auto max-w-7xl px-4 pb-20 sm:px-6">
        <div className="mb-16">
        <PlanColumns />
      </div>

      <div className="mx-auto max-w-3xl">
          <h2 className="mb-8 text-center text-2xl font-bold uppercase tracking-tight text-[#F8FAFC]">
            FREQUENTLY ASKED
          </h2>
          <div className="space-y-2">
            {FAQS.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-[#2A3548] bg-[#111827]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-5 text-sm font-bold text-[#F8FAFC] [&::-webkit-details-marker]:hidden">
                  {faq.q}
                  <Icon name="arrow-down" className="h-4 w-4 shrink-0 text-[#C8F400] transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
                </summary>
                <p className="max-w-[56ch] px-5 pb-5 text-sm leading-relaxed text-[#94A3B8]">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
