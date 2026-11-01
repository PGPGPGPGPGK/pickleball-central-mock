"use client";

/**
 * One payment runner for every website purchase (court, membership,
 * coaching): open Razorpay Checkout for an intent the API already created,
 * prefilled with the details collected at checkout, then confirm through the
 * service's own server-side `/verify` endpoint. The page never decides a
 * payment succeeded — only the API's signature check does.
 *
 * Local development: when the API runs `RAZORPAY_DRIVER=stub` its intents
 * carry key `rzp_test_stub`; `simulate` then stands in for the popup via
 * POST /v1/dev/razorpay/checkout (which only exists in that mode).
 */
import { authFetch } from "./auth";

export type Intent = {
  payment_id: string;
  razorpay_order_id: string;
  razorpay_key_id: string;
  amount_paise: number;
};

export type Prefill = { name: string; email: string; contact: string };

export type PayOutcome =
  | { kind: "paid"; verified: unknown }
  | { kind: "dismissed" }
  | { kind: "failed"; message: string };

export const isDevIntent = (i: Intent) => i.razorpay_key_id === "rzp_test_stub";

type CheckoutSuccess = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string };
// Same global shape the existing event forms declare (declarations must match).
type RazorpayCheckout = { open: () => void; close: () => void };
type RazorpayCtor = new (opts: Record<string, unknown>) => RazorpayCheckout;
declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

let loader: Promise<RazorpayCtor> | null = null;
function loadRazorpay(): Promise<RazorpayCtor> {
  if (window.Razorpay) return Promise.resolve(window.Razorpay);
  loader ??= new Promise<RazorpayCtor>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.async = true;
    s.onload = () => (window.Razorpay ? resolve(window.Razorpay) : reject(new Error("Razorpay Checkout failed to load")));
    s.onerror = () => {
      loader = null;
      reject(new Error("Razorpay Checkout failed to load"));
    };
    document.head.appendChild(s);
  });
  return loader;
}

/** Real Razorpay popup; resolves with the success triple, or a dismissal/failure. */
function openRazorpay(
  intent: Intent,
  prefill: Prefill,
  description: string,
): Promise<{ ok: true; r: CheckoutSuccess } | { ok: false; dismissed: boolean; message: string }> {
  return loadRazorpay().then(
    (Razorpay) =>
      new Promise((resolve) => {
        const rzp = new Razorpay({
          key: intent.razorpay_key_id,
          order_id: intent.razorpay_order_id,
          amount: intent.amount_paise,
          currency: "INR",
          name: "Pickleball Central",
          description,
          prefill,
          theme: { color: "#C8F400" },
          handler: (r: CheckoutSuccess) => resolve({ ok: true, r }),
          modal: { ondismiss: () => resolve({ ok: false, dismissed: true, message: "" }) },
        });
        (rzp as unknown as { on: (e: string, cb: () => void) => void }).on("payment.failed", () =>
          resolve({ ok: false, dismissed: false, message: "Payment failed. No money was taken for this attempt." }),
        );
        rzp.open();
      }),
  );
}

/** Local stub only: what the popup would return for a success or a decline. */
export async function simulate(intent: Intent, outcome: "success" | "failure") {
  return authFetch<{ outcome: string } & Partial<CheckoutSuccess>>("/v1/dev/razorpay/checkout", {
    method: "POST",
    body: JSON.stringify({ order_id: intent.razorpay_order_id, outcome }),
  });
}

/** Confirm on the server — the only point a purchase becomes real. */
export function verify(verifyPath: string, r: CheckoutSuccess): Promise<unknown> {
  return authFetch(verifyPath, { method: "POST", body: JSON.stringify(r) });
}

/** Real Razorpay path end to end. (The dev path is driven by the UI's simulator.) */
export async function pay(intent: Intent, prefill: Prefill, description: string, verifyPath: string): Promise<PayOutcome> {
  const res = await openRazorpay(intent, prefill, description);
  if (!res.ok) return res.dismissed ? { kind: "dismissed" } : { kind: "failed", message: res.message };
  return { kind: "paid", verified: await verify(verifyPath, res.r) };
}
