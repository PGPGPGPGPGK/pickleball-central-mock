/**
 * Membership plans as side-by-side columns — compare row by row, on a phone
 * too (the four columns stay in view; the row labels sit above each value).
 * Figures are the site's existing plan data (lib/membership-plans.ts), never
 * invented here. Each column's button goes straight to payment.
 */
import Link from "next/link";

import { MEMBERSHIP_PLANS } from "@/lib/membership-plans";

const MONTHS: Record<string, number> = { monthly: 1, quarterly: 3, "half-yearly": 6, yearly: 12 };
const perMonth = (price: string, id: string) =>
  `₹${Math.round(Number(price.replace(/[^\d]/g, "")) / (MONTHS[id] ?? 1)).toLocaleString("en-IN")}`;
const shortName = (n: string) => n.charAt(0) + n.slice(1).toLowerCase();

export function PlanColumns() {
  return (
    <section aria-label="Compare membership plans">
      <div className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {MEMBERSHIP_PLANS.map((p) => (
          <div
            key={p.id}
            className={`flex flex-col rounded-2xl border p-2.5 text-center sm:p-5 ${p.featured ? "border-[#C8F400] bg-[#C8F400]/[0.06]" : "border-white/10 bg-[#111827]"}`}
          >
            <p className="min-h-[1.25rem] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#C8F400]">
              {p.badge ? "Popular" : ""}
            </p>
            <h2 className="flex min-h-[2.25rem] items-center justify-center font-display text-lg font-extrabold uppercase leading-none text-white sm:min-h-0 sm:text-2xl">{shortName(p.name)}</h2>

            <Cell label="You pay">
              <span className="font-display text-xl font-bold text-white sm:text-3xl">{p.price}</span>
              {/* Same height in every column so the rows line up. */}
              <span className={`block text-xs text-[#94A3B8] ${p.strikePrice ? "line-through" : "invisible"}`} aria-hidden={!p.strikePrice}>
                {p.strikePrice ?? "—"}
              </span>
            </Cell>
            <Cell label="Per month">{perMonth(p.price, p.id)}</Cell>
            <Cell label="Saving">{p.savingLabel?.replace("Save ", "") ?? "—"}</Cell>
            <Cell label="Free hours">30/mo</Cell>
            <Cell label="Commitment">{p.id === "monthly" ? "None" : p.id === "yearly" ? "1 year" : `${MONTHS[p.id]} months`}</Cell>

            <Link
              href={`/membership/join?plan=${p.id}`}
              aria-label={`Choose ${shortName(p.name)} — ${p.price}`}
              className={`mt-3 inline-flex h-10 items-center justify-center rounded-full text-sm font-semibold transition-colors sm:h-11 ${p.featured ? "bg-[#C8F400] text-[#0A0F1E] hover:bg-[#D8FF20]" : "bg-white text-[#0A0F1E] hover:bg-[#E2E8F0]"}`}
            >
              Choose
            </Link>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-[#94A3B8]">
        Same membership on every plan. Longer terms add a bigger discount on extra hours and F&amp;B, and more guest passes. All prices include 18% GST.
      </p>
    </section>
  );
}

function Cell({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3 border-t border-white/[0.08] pt-2.5">
      <p className="text-[11px] text-[#94A3B8]">{label}</p>
      <p className="mt-0.5 text-sm font-semibold text-white">{children}</p>
    </div>
  );
}
