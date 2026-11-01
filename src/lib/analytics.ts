/**
 * Client analytics — one entry point for every conversion event.
 *
 * `track()` pushes to the GTM `dataLayer` (so GTM can route to GA4, Google
 * Ads, or any container tag) AND fires the Meta Pixel directly (the Pixel is
 * installed in-code in layout.tsx, not via GTM). We deliberately do NOT call
 * `gtag()` here: GA4 is routed through GTM off the same dataLayer events, so
 * a direct gtag call would double-count.
 *
 * Event names are Meta's standard events (ViewContent / InitiateCheckout /
 * Purchase / Lead) — GA4 triggers in GTM map them to view_item / begin_checkout
 * / purchase / generate_lead.
 *
 * `eventId` (for Purchase) is the payment id. The server-side Meta Conversions
 * API sends the same `event_id`, so Meta de-duplicates the browser + server
 * Purchase into one conversion.
 */

type Params = Record<string, unknown>;

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    fbq?: (...args: unknown[]) => void;
    dataLayer?: Record<string, unknown>[];
  }
}

export type TrackEvent =
  | "ViewContent"
  | "InitiateCheckout"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration";

export function track(event: TrackEvent, params: Params = {}, opts?: { eventId?: string }): void {
  if (typeof window === "undefined") return;

  // GTM dataLayer — the single stream GTM routes to GA4 / Ads / etc.
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params, ...(opts?.eventId ? { event_id: opts.eventId } : {}) });

  // Meta Pixel (in-code). eventID lets server CAPI de-dupe the same conversion.
  if (typeof window.fbq === "function") {
    if (opts?.eventId) window.fbq("track", event, params, { eventID: opts.eventId });
    else window.fbq("track", event, params);
  }
}

/**
 * Funnel micro-events (non-standard names). Pushed to the GTM dataLayer like
 * `track()`, but sent to Meta via `fbq('trackCustom', …)` — Meta rejects
 * non-standard names on the regular `track` call. These complement (never
 * replace) the standard InitiateCheckout / Purchase / CompleteRegistration.
 */
export type CustomTrackEvent =
  | "view_register"
  | "start_form"
  | "add_players"
  | "apply_coupon"
  | "begin_checkout"
  | "payment_success"
  | "payment_failed";

export function trackCustom(event: CustomTrackEvent, params: Params = {}): void {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event, ...params });
  if (typeof window.fbq === "function") window.fbq("trackCustom", event, params);
}

export type Utm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  src?: string;
  ref?: string;
  landing?: string;
};

/**
 * First-party attribution read. Captures the standard UTM tuple plus the ad
 * `src`/`ref` params and the landing path — the same fields the old Apps Script
 * funnel recorded — so campaign attribution survives the move to our backend.
 */
export function readUtm(): Utm | undefined {
  if (typeof window === "undefined") return undefined;
  const q = new URLSearchParams(window.location.search);
  const utm: Utm = {};
  const put = (key: keyof Utm, param: string): void => {
    const v = q.get(param);
    if (v) utm[key] = v.slice(0, 200);
  };
  put("source", "utm_source");
  put("medium", "utm_medium");
  put("campaign", "utm_campaign");
  put("content", "utm_content");
  put("term", "utm_term");
  put("src", "src");
  put("ref", "ref");
  const landing = window.location.pathname;
  if (landing) utm.landing = landing;
  return Object.keys(utm).length > 0 ? utm : undefined;
}
