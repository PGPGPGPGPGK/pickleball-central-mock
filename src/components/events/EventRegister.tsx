"use client";

/**
 * Inline, account-optional event registration + Razorpay checkout.
 *
 * Powers the generic /events/[slug] pages (events without a bespoke page —
 * bespoke Season 5 / DUPR Night forms live in their own components but the
 * generic route can serve those events too). Posts to the public register
 * endpoint (no login), then opens Razorpay Checkout and confirms
 * SYNCHRONOUSLY from the Checkout success handler (same as the bespoke
 * forms — the events flow has no webhook), with the status poll kept as a
 * backup. Collects gender + T&C + full partner details so per_team
 * categories (Season 5) work here too; DUPR ID + rating are mandatory.
 * Fires Meta Pixel funnel events on the existing site-wide `fbq`.
 */
import { AppNudge } from "./AppNudge";
import { useCallback, useEffect, useRef, useState } from "react";

import { readUtm, track } from "@/lib/analytics";
import {
  fetchPublicPaymentStatus,
  registerForEvent,
  verifyEventPayment,
  type EventPersonGender,
  type EventRegisterResponse,
  type PublicTournamentCategory,
} from "@/lib/api";
import { friendlyError } from "@/lib/friendly-error";

const POLL_INTERVAL_MS = 2500;
const POLL_TIMEOUT_MS = 120_000;

const SKILL_LABEL: Record<string, string> = {
  amateur: "Amateur",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "Open",
};
const GENDER_LABEL: Record<string, string> = {
  men: "Men",
  women: "Women",
  mixed: "Mixed",
  open: "Open",
};
const PLAY_LABEL: Record<string, string> = { singles: "Singles", doubles: "Doubles" };

type RazorpayCheckout = { open: () => void; close: () => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayCheckout;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    Razorpay?: RazorpayCtor;
    fbq?: (...args: unknown[]) => void;
  }
}

let razorpayLoaderPromise: Promise<RazorpayCtor> | null = null;

function loadRazorpay(): Promise<RazorpayCtor> {
  if (typeof window === "undefined") return Promise.reject(new Error("ssr"));
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  if (razorpayLoaderPromise) return razorpayLoaderPromise;
  razorpayLoaderPromise = new Promise<RazorpayCtor>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      if (window.Razorpay) resolve(window.Razorpay);
      else reject(new Error("Razorpay Checkout failed to load"));
    };
    script.onerror = () => reject(new Error("Razorpay Checkout failed to load"));
    document.head.appendChild(script);
  });
  return razorpayLoaderPromise;
}

function catLabel(c: PublicTournamentCategory): string {
  return `${PLAY_LABEL[c.play_type] ?? c.play_type} ${SKILL_LABEL[c.skill_level] ?? c.skill_level} ${GENDER_LABEL[c.gender] ?? c.gender}`;
}

type Props = { slug: string; eventName: string; categories: PublicTournamentCategory[] };

export function EventRegister({ slug, eventName, categories }: Props) {
  const firstOpen = categories.find((c) => c.max_registrations - c.confirmed_count > 0);
  const [categoryId, setCategoryId] = useState(firstOpen?.id ?? categories[0]?.id ?? "");
  const selected = categories.find((c) => c.id === categoryId);
  const isDoubles = selected?.play_type === "doubles";

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("+91");
  const [gender, setGender] = useState<EventPersonGender | "">("");
  const [duprId, setDuprId] = useState("");
  const [duprRating, setDuprRating] = useState("");
  const [partnerName, setPartnerName] = useState("");
  const [partnerPhone, setPartnerPhone] = useState("+91");
  const [partnerGender, setPartnerGender] = useState<EventPersonGender | "">("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [accepted, setAccepted] = useState(false);

  const [stage, setStage] = useState<"form" | "pay" | "done" | "error">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resp, setResp] = useState<EventRegisterResponse | null>(null);
  const idemRef = useRef(crypto.randomUUID());

  const submit = useCallback(async () => {
    if (!selected) {
      setError("Pick a category.");
      return;
    }
    if (!fullName.trim() || phone.trim().replace(/\D/g, "").length < 6) {
      setError("Enter your name and a valid phone number.");
      return;
    }
    if (!gender) {
      setError("Select your gender.");
      return;
    }
    const ratingNum = Number.parseFloat(duprRating);
    if (!duprId.trim() || !(duprRating.trim() !== "" && Number.isFinite(ratingNum))) {
      setError("Your DUPR ID and rating are required.");
      return;
    }
    if (selected.dupr_cap_max != null && ratingNum > selected.dupr_cap_max) {
      setError(`This category needs DUPR ${selected.dupr_cap_max} or below.`);
      return;
    }
    if (isDoubles) {
      if (!partnerName.trim() || partnerPhone.trim().replace(/\D/g, "").length < 6) {
        setError("Doubles needs your partner's name and phone number.");
        return;
      }
      if (!partnerGender) {
        setError("Select your partner's gender.");
        return;
      }
    }
    if (!accepted) {
      setError("Please accept the rules & terms.");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const utm = readUtm();
      const r = await registerForEvent({
        slug,
        idempotencyKey: idemRef.current,
        body: {
          category_id: selected.id,
          registrant: {
            full_name: fullName.trim(),
            phone: phone.trim().replace(/\s+/g, ""),
            gender,
            dupr_id: duprId.trim(),
            dupr_rating: ratingNum,
          },
          ...(isDoubles
            ? {
                // Auto-derived team name — required for per_team doubles,
                // ignored by per-head events.
                team_name: `${fullName.trim()} & ${partnerName.trim()}`.slice(0, 120),
                partner: {
                  full_name: partnerName.trim(),
                  phone: partnerPhone.trim().replace(/\s+/g, ""),
                  gender: partnerGender as EventPersonGender,
                },
              }
            : {}),
          terms_accepted: true,
          whatsapp_opt_in: whatsapp,
          ...(utm ? { utm } : {}),
        },
      });
      setResp(r);
      if (r.status === "confirmed" || !r.payment) {
        track("CompleteRegistration", { content_name: eventName, status: true });
        setStage("done");
        return;
      }
      track("InitiateCheckout", {
        value: r.payment.amount_paise / 100,
        currency: "INR",
        content_name: eventName,
      });
      setStage("pay");
    } catch (err) {
      setError(friendlyError(err, "Couldn’t complete your registration. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }, [
    selected,
    fullName,
    phone,
    gender,
    isDoubles,
    partnerName,
    partnerPhone,
    partnerGender,
    duprId,
    duprRating,
    whatsapp,
    accepted,
    slug,
    eventName,
  ]);

  // Pay stage: open Razorpay + poll the public status endpoint.
  useEffect(() => {
    if (stage !== "pay" || !resp?.payment) return;
    const payment = resp.payment;
    let cancelled = false;
    let pollTimer: number | null = null;
    const stopAt = Date.now() + POLL_TIMEOUT_MS;
    let checkout: RazorpayCheckout | null = null;

    // Synchronous confirmation from the Checkout success handler — the events
    // flow verifies the Razorpay signature server-side, no webhook needed.
    const confirm = async (rzp: {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    }) => {
      try {
        await verifyEventPayment({
          paymentId: payment.payment_id,
          razorpayOrderId: rzp.razorpay_order_id ?? payment.razorpay_order_id,
          razorpayPaymentId: rzp.razorpay_payment_id ?? "",
          razorpaySignature: rzp.razorpay_signature ?? "",
          idempotencyKey: crypto.randomUUID(),
        });
        if (cancelled) return;
        track("Purchase", {
          value: payment.amount_paise / 100,
          currency: "INR",
          content_name: eventName,
        });
        track("CompleteRegistration", { content_name: eventName, status: true });
        checkout?.close();
        setStage("done");
      } catch {
        if (cancelled) return;
        setError(
          "Couldn’t confirm the payment. If you were charged, call 9700744634 and we’ll sort it out.",
        );
        setStage("error");
      }
    };

    void (async () => {
      try {
        const Razorpay = await loadRazorpay();
        if (cancelled) return;
        checkout = new Razorpay({
          key: payment.razorpay_key_id,
          order_id: payment.razorpay_order_id,
          amount: payment.amount_paise,
          currency: payment.currency,
          name: "Pickleball Central",
          description: eventName,
          prefill: { name: fullName, contact: phone },
          theme: { color: "#C8F400" },
          handler: (r: Record<string, string>) => void confirm(r),
          modal: {
            ondismiss: () => {
              // Fresh idempotency key: the registration + order behind the
              // old key already exist, so an EDITED retry would 409. A new
              // key makes the retry a fresh registration.
              idemRef.current = crypto.randomUUID();
              setError("Payment cancelled. You can try again.");
              setStage("form");
            },
          },
        });
        checkout.open();
      } catch (err) {
        setError(friendlyError(err, "Couldn’t start payment. Please try again."));
        setStage("error");
      }
    })();

    const tick = async () => {
      if (cancelled) return;
      try {
        const status = await fetchPublicPaymentStatus({
          paymentId: payment.payment_id,
          razorpayOrderId: payment.razorpay_order_id,
        });
        if (status.status === "captured") {
          track("Purchase", {
            value: payment.amount_paise / 100,
            currency: "INR",
            content_name: eventName,
          });
          track("CompleteRegistration", { content_name: eventName, status: true });
          checkout?.close();
          setStage("done");
          return;
        }
        if (status.status === "failed") {
          setError("Payment failed. Try again or use a different method.");
          setStage("error");
          checkout?.close();
          return;
        }
      } catch {
        // transient — keep polling
      }
      if (Date.now() > stopAt) {
        setError(
          "Timed out waiting for confirmation. If you were charged, you'll get a WhatsApp confirmation shortly.",
        );
        setStage("error");
        checkout?.close();
        return;
      }
      pollTimer = window.setTimeout(() => void tick(), POLL_INTERVAL_MS);
    };
    pollTimer = window.setTimeout(() => void tick(), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimer !== null) clearTimeout(pollTimer);
      checkout?.close();
    };
  }, [stage, resp, eventName, fullName, phone]);

  if (stage === "done") {
    return (
      <div className="rounded-lg border border-volt bg-grey-950 p-6">
        <p className="pc-label text-volt">You&apos;re in 🎉</p>
        <h3 className="mt-2 text-xl font-medium text-white">Registration confirmed</h3>
        <p className="mt-2 text-sm text-grey-300">
          We&apos;ve got your spot for {eventName}. A confirmation is on its way to{" "}
          {phone || "your phone"} on WhatsApp.
        </p>
        <AppNudge {...(phone ? { phone } : {})} />
      </div>
    );
  }

  const inputCls =
    "mt-1 w-full rounded-md border border-grey-800 bg-grey-900 px-3 py-2 text-white placeholder:text-grey-500 focus:border-volt focus:outline-none";

  return (
    <div className="rounded-lg border border-grey-800 bg-grey-950 p-6">
      <h3 className="text-xl font-medium text-white">Register</h3>

      {stage === "pay" ? (
        <p className="mt-4 text-sm text-grey-300">
          Opening secure payment… complete it in the Razorpay window. This page will confirm
          automatically.
        </p>
      ) : (
        <div className="mt-4 space-y-4">
          <div>
            <label className="pc-label text-grey-400" htmlFor="evt-cat">
              Category
            </label>
            <select
              id="evt-cat"
              className={inputCls}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
            >
              {categories.map((c) => {
                const remaining = c.max_registrations - c.confirmed_count;
                return (
                  <option key={c.id} value={c.id} disabled={remaining <= 0}>
                    {catLabel(c)} — ₹{c.entry_fee.toLocaleString("en-IN")}
                    {remaining <= 0 ? " (Full)" : ""}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-name">
                Your name
              </label>
              <input
                id="evt-name"
                className={inputCls}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-phone">
                Phone (WhatsApp)
              </label>
              <input
                id="evt-phone"
                className={inputCls}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91…"
                inputMode="tel"
              />
            </div>
          </div>

          <div>
            <label className="pc-label text-grey-400" htmlFor="evt-gender">
              Gender
            </label>
            <select
              id="evt-gender"
              className={inputCls}
              value={gender}
              onChange={(e) => setGender(e.target.value as EventPersonGender | "")}
            >
              <option value="">Select gender…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-dupr">
                DUPR ID
              </label>
              <input
                id="evt-dupr"
                className={inputCls}
                value={duprId}
                onChange={(e) => setDuprId(e.target.value)}
                placeholder="e.g. ABC123"
              />
            </div>
            <div>
              <label className="pc-label text-grey-400" htmlFor="evt-dupr-rating">
                DUPR rating
              </label>
              <input
                id="evt-dupr-rating"
                className={inputCls}
                value={duprRating}
                onChange={(e) => setDuprRating(e.target.value)}
                placeholder="e.g. 3.2"
                inputMode="decimal"
              />
            </div>
          </div>
          <p className="text-xs text-grey-500">
            DUPR ID &amp; rating are required — every match is DUPR-rated. No account? Create one
            free at{" "}
            <a
              href="https://dashboard.dupr.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="text-volt underline"
            >
              dupr.com
            </a>
            .
          </p>

          {isDoubles && (
            <>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="pc-label text-grey-400" htmlFor="evt-pname">
                    Partner name
                  </label>
                  <input
                    id="evt-pname"
                    className={inputCls}
                    value={partnerName}
                    onChange={(e) => setPartnerName(e.target.value)}
                    placeholder="Partner full name"
                  />
                </div>
                <div>
                  <label className="pc-label text-grey-400" htmlFor="evt-pphone">
                    Partner phone
                  </label>
                  <input
                    id="evt-pphone"
                    className={inputCls}
                    value={partnerPhone}
                    onChange={(e) => setPartnerPhone(e.target.value)}
                    placeholder="+91…"
                    inputMode="tel"
                  />
                </div>
              </div>
              <div>
                <label className="pc-label text-grey-400" htmlFor="evt-pgender">
                  Partner gender
                </label>
                <select
                  id="evt-pgender"
                  className={inputCls}
                  value={partnerGender}
                  onChange={(e) => setPartnerGender(e.target.value as EventPersonGender | "")}
                >
                  <option value="">Select gender…</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </>
          )}

          <label className="flex items-start gap-2 text-sm text-grey-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={whatsapp}
              onChange={(e) => setWhatsapp(e.target.checked)}
            />
            Send my confirmation and event updates on WhatsApp.
          </label>
          <label className="flex items-start gap-2 text-sm text-grey-300">
            <input
              type="checkbox"
              className="mt-1"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I accept the event rules and terms &amp; conditions.
          </label>

          {selected && (
            <button
              type="button"
              onClick={() => void submit()}
              disabled={submitting}
              className="pc-label w-full rounded-md bg-volt px-4 py-3 text-black hover:bg-volt-dark disabled:opacity-60"
            >
              {submitting
                ? "Please wait…"
                : `Register & Pay ₹${selected.entry_fee.toLocaleString("en-IN")}`}
            </button>
          )}
        </div>
      )}

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
    </div>
  );
}
