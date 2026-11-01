/**
 * Live coaching plans + daily timings — the same data the app's Coaching
 * screen shows (GET /v1/public/coaching). Nothing here is typed in by hand.
 */
import Link from "next/link";

import { type CoachingPlan, coachingFrequency, hourLabel } from "@/lib/api";

export function CoachingPlans({ data }: { data: { plans: CoachingPlan[]; slot_hours: number[] } | null }) {
  if (!data || data.plans.length === 0) {
    return (
      <p className="rounded-2xl border border-white/10 p-5 text-sm text-[#CBD5E1]">
        Current coaching plans and prices are in the app. Ask on WhatsApp if you&rsquo;d like details.
      </p>
    );
  }
  return (
    <section aria-labelledby="plans-h">
      <h2 id="plans-h" className="font-display text-3xl font-extrabold uppercase text-white md:text-4xl">
        Plans, prices &amp; timings
      </h2>
      <ul className="mt-4 divide-y divide-white/[0.08] rounded-2xl border border-white/10 bg-[#111827]">
        {data.plans.map((p) => (
          <li key={p.id} className="flex items-center justify-between gap-4 p-4">
            <div className="min-w-0">
              <p className="font-semibold text-white">{p.name}</p>
              <p className="text-sm text-[#94A3B8]">
                {[coachingFrequency(p.duration) === p.name ? null : coachingFrequency(p.duration), p.description]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <span className="font-display text-2xl font-bold text-white">₹{(p.price_paise / 100).toLocaleString("en-IN")}</span>
              <Link
                href={`/coaching/join?plan=${p.id}`}
                aria-label={`Choose ${p.name} — ₹${(p.price_paise / 100).toLocaleString("en-IN")}`}
                className="inline-flex h-10 items-center rounded-full bg-[#C8F400] px-4 text-sm font-semibold text-[#0A0F1E] hover:bg-[#D8FF20]"
              >
                Choose
              </Link>
            </div>
          </li>
        ))}
      </ul>
      {data.slot_hours.length ? (
        <p className="mt-3 text-sm text-[#CBD5E1]">
          <span className="font-semibold text-white">Timings:</span> 1-hour slots —{" "}
          {data.slot_hours.map(hourLabel).join(" · ")}. You pick your slot at checkout.
        </p>
      ) : null}
      <p className="mt-1 text-xs text-[#94A3B8]">Pay here on the website; see your schedule and sessions in the app.</p>
    </section>
  );
}
