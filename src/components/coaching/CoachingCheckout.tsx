"use client";

/**
 * /coaching/join?plan=… — enrol and pay on the website (POST /v1/coaching/enroll
 * → Razorpay → server verify), exactly the app's flow: pick the plan's daily
 * slot (and a date for a single session). Day-to-day use is in the app.
 */
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { type CoachingPlan, coachingFrequency, fetchPublicCoaching, hourLabel } from "@/lib/api";
import { authFetch, type Me } from "@/lib/auth";
import { nextDays } from "@/lib/booking";
import { type Intent, isDevIntent, pay, simulate, verify } from "@/lib/checkout";
import { istToday } from "@/lib/format";
import { friendlyError } from "@/lib/friendly-error";
import { STORES } from "@/lib/site";

import { ContactDetails } from "../checkout/ContactDetails";
import { Icon } from "../site/Icon";
import { btnPrimary, btnSecondary, SampleBadge } from "../site/ui";

export function CoachingCheckout({ planId }: { planId: string }) {
  const [data, setData] = useState<{ plans: CoachingPlan[]; slot_hours: number[] } | null>(null);
  const [slot, setSlot] = useState<number | null>(null);
  const [day, setDay] = useState<string | null>(null);
  const [me, setMe] = useState<Me | null>(null);
  const onReady = useCallback((m: Me | null) => setMe(m), []);
  const [state, setState] = useState<{ kind: "idle" } | { kind: "working" } | { kind: "dev"; intent: Intent } | { kind: "error"; message: string } | { kind: "paid" }>({ kind: "idle" });

  useEffect(() => {
    void fetchPublicCoaching().then(setData);
  }, []);
  const plan = data?.plans.find((p) => p.id === planId) ?? null;
  const single = plan?.duration === "single";
  const days = nextDays(istToday(), 15).slice(1);
  const canPay = Boolean(me && plan && slot !== null && (!single || day));
  const verifyPath = (i: Intent) => `/v1/coaching/payments/${i.payment_id}/verify`;

  const start = async () => {
    if (!me || !plan || slot === null) return;
    setState({ kind: "working" });
    try {
      const intent = await authFetch<Intent>("/v1/coaching/enroll", {
        method: "POST",
        body: JSON.stringify({ coaching_plan_id: plan.id, slot_hour: slot, ...(single && day ? { session_date: day } : {}) }),
      });
      if (isDevIntent(intent)) return setState({ kind: "dev", intent });
      const out = await pay(intent, { name: me.full_name, email: me.email, contact: me.phone ?? "" }, `${plan.name} coaching`, verifyPath(intent));
      setState(out.kind === "paid" ? { kind: "paid" } : { kind: "error", message: out.kind === "failed" ? out.message : "Payment not completed. You can try again." });
    } catch (err) {
      setState({ kind: "error", message: friendlyError(err, "Couldn't start the payment. Please try again.") });
    }
  };

  const devPay = async (intent: Intent, outcome: "success" | "failure") => {
    setState({ kind: "working" });
    try {
      const r = await simulate(intent, outcome);
      if (!r.razorpay_signature) return setState({ kind: "error", message: "Payment failed. No money was taken for this attempt." });
      await verify(verifyPath(intent), { razorpay_payment_id: r.razorpay_payment_id!, razorpay_order_id: r.razorpay_order_id!, razorpay_signature: r.razorpay_signature });
      setState({ kind: "paid" });
    } catch (err) {
      setState({ kind: "error", message: friendlyError(err, "Payment couldn't be confirmed.") });
    }
  };

  if (!data) return <div className="h-64 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" />;
  if (!plan) {
    return (
      <p className="text-[#CBD5E1]">
        That plan isn&rsquo;t available. <Link href="/coaching" className="text-[#C8F400] hover:underline">See current plans</Link>
      </p>
    );
  }

  if (state.kind === "paid") {
    return (
      <div>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#C8F400] text-[#0A0F1E]">
          <Icon name="check" className="h-7 w-7" strokeWidth={2.6} />
        </div>
        <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[0.9] text-white">You&rsquo;re enrolled</h1>
        <p className="mt-3 text-[#CBD5E1]">
          {plan.name} coaching, {hourLabel(slot!)}
          {single && day ? ` on ${new Date(`${day}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}` : ""}. Your receipt is on its way by email.
        </p>
        <div className="mt-6 rounded-2xl border border-[#C8F400]/30 bg-[#C8F400]/[0.05] p-5">
          <p className="font-semibold text-white">Next: get the app for your sessions</p>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            Sign in with <strong className="text-white">{me?.phone}</strong> to see your schedule, sessions and coach updates. Your enrolment is already on that account.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <a href={STORES.android} className={btnPrimary}>Get it on Google Play</a>
            <a href={STORES.ios} className={btnSecondary}>Download on the App Store</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl">Review &amp; checkout</h1>
      <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
        <p className="text-sm text-white">
          <span className="font-semibold">{plan.name} coaching</span>
          <span className="text-[#CBD5E1]"> · {coachingFrequency(plan.duration)}</span>
        </p>
        <Link href="/coaching" className="shrink-0 text-sm font-medium text-[#C8F400] hover:underline">Change</Link>
      </div>

      <fieldset className="mt-4">
        <legend className="text-sm font-semibold text-white">Your slot</legend>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {data.slot_hours.map((h) => (
            <button key={h} type="button" aria-pressed={slot === h} onClick={() => setSlot(h)} className={`h-11 rounded-xl border text-sm font-medium ${slot === h ? "border-[#C8F400] bg-[#C8F400] text-[#0A0F1E]" : "border-white/10 text-white hover:border-white/30"}`}>
              {hourLabel(h)}
            </button>
          ))}
        </div>
      </fieldset>

      {single ? (
        <fieldset className="mt-4">
          <legend className="text-sm font-semibold text-white">Day</legend>
          <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
            {days.map((d) => {
              const dt = new Date(`${d}T12:00:00+05:30`);
              return (
                <button key={d} type="button" aria-pressed={day === d} onClick={() => setDay(d)} className={`flex h-[60px] w-[54px] shrink-0 flex-col items-center justify-center rounded-xl border ${day === d ? "border-[#C8F400] bg-[#C8F400] text-[#0A0F1E]" : "border-white/10 text-white"}`}>
                  <span className="text-[11px]">{dt.toLocaleDateString("en-IN", { weekday: "short", timeZone: "Asia/Kolkata" })}</span>
                  <span className="font-display text-xl font-bold leading-none">{dt.getUTCDate()}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      <div className="mt-4">
        <ContactDetails onReady={onReady} />
      </div>

      <div className="mt-3 flex items-baseline justify-between rounded-2xl border border-white/10 bg-[#111827] p-4">
        <span className="font-semibold text-white">Total</span>
        <span className="font-display text-3xl font-bold text-white">₹{(plan.price_paise / 100).toLocaleString("en-IN")}</span>
      </div>

      {state.kind === "error" ? <p role="alert" className="mt-4 rounded-xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.08] p-3 text-sm text-[#FFD7DD]">{state.message}</p> : null}

      {state.kind === "dev" ? (
        <div role="dialog" aria-label="Simulated checkout" className="mt-5 rounded-2xl border border-amber-300/40 bg-[#14110A] p-5">
          <SampleBadge>Test payment · local API</SampleBadge>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => void devPay(state.intent, "success")} className={btnPrimary}>Simulate paid</button>
            <button type="button" onClick={() => void devPay(state.intent, "failure")} className={btnSecondary}>Simulate failure</button>
          </div>
        </div>
      ) : (
        <>
          <button type="button" disabled={!canPay || state.kind === "working"} onClick={() => void start()} className={`${btnPrimary} mt-5 w-full`}>
            {state.kind === "working" ? "Opening payment…" : `Pay ₹${(plan.price_paise / 100).toLocaleString("en-IN")}`}
          </button>
          <p className="mt-3 text-center text-xs text-[#94A3B8]">
            {slot === null ? "Pick your slot above." : single && !day ? "Pick a day above." : !me ? "Add your details above to pay." : "Secure payment by Razorpay."}
          </p>
        </>
      )}
    </div>
  );
}
