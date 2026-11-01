"use client";

/**
 * /membership/join?plan=… — straight from a plan column to payment.
 * Same details block as courts (phone = the account, email cross-checked),
 * then POST /v1/memberships/subscribe → Razorpay → server verify. After
 * paying, the customer downloads the app and signs in with the same number:
 * the membership is already on that account.
 */
import Link from "next/link";
import { useCallback, useState } from "react";

import { authFetch, type Me } from "@/lib/auth";
import { type Intent, isDevIntent, pay, simulate, verify } from "@/lib/checkout";
import { friendlyError } from "@/lib/friendly-error";
import { MEMBERSHIP_PLANS } from "@/lib/membership-plans";
import { STORES } from "@/lib/site";

import { ContactDetails } from "../checkout/ContactDetails";
import { Icon } from "../site/Icon";
import { btnPrimary, btnSecondary, SampleBadge } from "../site/ui";

/** Site plan id → the API's billing period. */
const PERIOD: Record<string, string> = { monthly: "monthly", quarterly: "quarterly", "half-yearly": "half_yearly", yearly: "annually" };

type ApiPlan = { id: string; billing_period: string; price_paise: number };

export function MembershipCheckout({ planId }: { planId: string }) {
  const plan = MEMBERSHIP_PLANS.find((p) => p.id === planId) ?? MEMBERSHIP_PLANS[0]!;
  const [me, setMe] = useState<Me | null>(null);
  const onReady = useCallback((m: Me | null) => setMe(m), []);
  const [state, setState] = useState<
    { kind: "idle" } | { kind: "working" } | { kind: "dev"; intent: Intent } | { kind: "error"; message: string } | { kind: "paid" }
  >({ kind: "idle" });

  const verifyPath = (i: Intent) => `/v1/memberships/payments/${i.payment_id}/verify`;

  const start = async () => {
    if (!me) return;
    setState({ kind: "working" });
    try {
      const { plans } = await authFetch<{ plans: ApiPlan[] }>("/v1/membership-plans");
      const apiPlan = plans.find((p) => p.billing_period === PERIOD[plan.id]);
      if (!apiPlan) {
        return setState({ kind: "error", message: "This plan isn't available online yet. Please ask at the desk or on WhatsApp." });
      }
      const intent = await authFetch<Intent>("/v1/memberships/subscribe", {
        method: "POST",
        body: JSON.stringify({ plan_id: apiPlan.id }),
      });
      if (isDevIntent(intent)) return setState({ kind: "dev", intent });
      const out = await pay(intent, { name: me.full_name, email: me.email, contact: me.phone ?? "" }, `${plan.name} membership`, verifyPath(intent));
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
      await verify(verifyPath(intent), {
        razorpay_payment_id: r.razorpay_payment_id!,
        razorpay_order_id: r.razorpay_order_id!,
        razorpay_signature: r.razorpay_signature,
      });
      setState({ kind: "paid" });
    } catch (err) {
      setState({ kind: "error", message: friendlyError(err, "Payment couldn't be confirmed.") });
    }
  };

  if (state.kind === "paid") {
    return (
      <div>
        <div className="grid h-14 w-14 place-items-center rounded-full bg-[#C8F400] text-[#0A0F1E]">
          <Icon name="check" className="h-7 w-7" strokeWidth={2.6} />
        </div>
        <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[0.9] text-white">You&rsquo;re a member</h1>
        <p className="mt-3 text-[#CBD5E1]">
          {plan.name.charAt(0) + plan.name.slice(1).toLowerCase()} membership, paid and active. Your receipt is on its way by email.
        </p>
        <div className="mt-6 rounded-2xl border border-[#C8F400]/30 bg-[#C8F400]/[0.05] p-5">
          <p className="font-semibold text-white">Next: get the app to use your membership</p>
          <p className="mt-1 text-sm text-[#CBD5E1]">
            Download Pickleball Central and sign in with <strong className="text-white">{me?.phone}</strong>. Your membership is already on that account — book courts with your free hours straight away.
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
          <span className="font-semibold">{plan.name.charAt(0) + plan.name.slice(1).toLowerCase()} membership</span>
          <span className="text-[#CBD5E1]"> · {plan.priceUnit}</span>
        </p>
        <Link href="/membership" className="shrink-0 text-sm font-medium text-[#C8F400] hover:underline">
          Change
        </Link>
      </div>

      <div className="mt-3">
        <ContactDetails onReady={onReady} />
      </div>

      <div className="mt-3 flex items-baseline justify-between rounded-2xl border border-white/10 bg-[#111827] p-4">
        <span className="font-semibold text-white">Total</span>
        <span className="text-right">
          <span className="font-display text-3xl font-bold text-white">{plan.price}</span>
          <span className="block text-xs text-[#94A3B8]">incl. 18% GST</span>
        </span>
      </div>

      {state.kind === "error" ? (
        <p role="alert" className="mt-4 rounded-xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.08] p-3 text-sm text-[#FFD7DD]">
          {state.message}
        </p>
      ) : null}

      {state.kind === "dev" ? (
        <div role="dialog" aria-label="Simulated checkout" className="mt-5 rounded-2xl border border-amber-300/40 bg-[#14110A] p-5">
          <SampleBadge>Test payment · local API</SampleBadge>
          <p className="mt-3 text-sm text-[#E2E8F0]">
            Razorpay would open for ₹{(state.intent.amount_paise / 100).toLocaleString("en-IN")}, prefilled with {me?.full_name}, {me?.email}, {me?.phone}.
          </p>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => void devPay(state.intent, "success")} className={btnPrimary}>Simulate paid</button>
            <button type="button" onClick={() => void devPay(state.intent, "failure")} className={btnSecondary}>Simulate failure</button>
          </div>
        </div>
      ) : (
        <>
          <button type="button" disabled={!me || state.kind === "working"} onClick={() => void start()} className={`${btnPrimary} mt-5 w-full`}>
            {state.kind === "working" ? "Opening payment…" : `Pay ${plan.price}`}
          </button>
          <p className="mt-3 text-center text-xs text-[#94A3B8]">
            {me ? "Secure payment by Razorpay. Your membership starts once payment is verified." : "Add your details above to pay."}
          </p>
        </>
      )}
    </div>
  );
}
