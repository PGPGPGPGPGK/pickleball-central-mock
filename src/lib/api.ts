/**
 * Marketing-side API client. Public endpoints only — no auth header,
 * no refresh-cookie dance. Used by the /play quick-booking widget.
 */
import { DEMO, DemoError, demoFetch } from "./demo";

/** Mock build: answer from the in-browser demo store, with real error shapes. */
export async function demoCall<T>(path: string, opts: RequestInit = {}): Promise<T> {
  try {
    return (await demoFetch(path, opts)) as T;
  } catch (e) {
    if (e instanceof DemoError) throw new ApiHttpError({ status: e.status, code: e.code, detail: e.message });
    throw e;
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8080";

export class ApiHttpError extends Error {
  readonly status: number;
  readonly code: string;
  readonly detail: string;
  readonly meta?: Record<string, unknown>;

  constructor(body: {
    status: number;
    code: string;
    detail: string;
    meta?: Record<string, unknown>;
  }) {
    super(body.detail);
    this.name = "ApiHttpError";
    this.status = body.status;
    this.code = body.code;
    this.detail = body.detail;
    if (body.meta !== undefined) this.meta = body.meta;
  }
}

/**
 * LOCAL PREVIEW ONLY (`NEXT_PUBLIC_PREVIEW_MOCKS=1`, set in .env.local, never
 * in a build env): public reads still go to the API, but no write — booking
 * hold, payment, event registration, coupon — can leave the machine. This is
 * the site's only network call, so one guard covers every form.
 */
export const PREVIEW_MOCKS = process.env.NEXT_PUBLIC_PREVIEW_MOCKS === "1";

async function publicFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  if (DEMO) return demoCall<T>(path, opts);
  if (PREVIEW_MOCKS && (opts.method ?? "GET").toUpperCase() !== "GET") {
    throw new ApiHttpError({
      status: 0,
      code: "preview_mode",
      detail: "Local preview — nothing was sent. Registrations and payments are disabled here.",
    });
  }
  const headers = new Headers(opts.headers);
  headers.set("accept", "application/json");
  if (opts.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...opts,
    headers,
  });
  if (!res.ok) {
    let body: { status: number; code: string; detail: string; meta?: Record<string, unknown> };
    try {
      const json = (await res.json()) as Partial<typeof body>;
      // The api error envelope sets `code` + (sometimes) `detail` but
      // not `status` — the HTTP response carries that. Authoritative
      // status comes from res.status; fall back through the JSON body
      // if it does happen to set one.
      body = {
        status: res.status,
        code: json.code ?? "unknown",
        detail: json.detail ?? res.statusText,
        ...(json.meta !== undefined ? { meta: json.meta } : {}),
      };
    } catch {
      body = { status: res.status, code: "unknown", detail: res.statusText };
    }
    throw new ApiHttpError(body);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export type FacilityCourt = {
  id: string;
  name: string;
  court_number: number;
  surface_type: string;
  status: "available" | "maintenance";
};

export type FacilityCell = {
  court_id: string;
  start_time: string;
  end_time: string;
  status: "free" | "held" | "booked" | "blocked" | "past";
  is_peak: boolean;
  price_per_hour: number;
  booking_id?: string;
};

export type FacilityGrid = {
  date: string;
  slot_minutes: number;
  courts: FacilityCourt[];
  cells: FacilityCell[];
  generated_at: string;
};

export async function fetchFacilityGrid(date: string): Promise<FacilityGrid> {
  return publicFetch<FacilityGrid>(`/v1/facility/grid?date=${encodeURIComponent(date)}`);
}

export type QuickBookSlot = {
  court_id: string;
  date: string;
  start_time: string;
  end_time: string;
};

export type QuickBookContact = {
  email: string;
  phone: string;
  full_name: string;
};

export type QuickBookResponse = {
  booking: {
    id: string;
    booking_number: string;
    hold_expires_in_seconds: number;
    total_amount: number;
    slots: {
      id: string;
      court_id: string;
      date: string;
      start_time: string;
      end_time: string;
      price: number;
    }[];
  };
  payment: {
    id: string;
    razorpay_order_id: string;
    razorpay_key_id: string;
    amount_paise: number;
    currency: "INR";
  };
  user: { id: string; created: boolean };
  replayed: boolean;
};

export async function quickBook(input: {
  contact: QuickBookContact;
  slots: QuickBookSlot[];
  idempotencyKey: string;
}): Promise<QuickBookResponse> {
  return publicFetch<QuickBookResponse>("/v1/bookings/quick", {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({ contact: input.contact, slots: input.slots }),
  });
}

export type PaymentStatusResponse = {
  id: string;
  payment_number: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  razorpay_order_id: string | null;
  razorpay_payment_id: string | null;
  amount_paise: number;
  total_amount: number;
  captured_at: string | null;
  booking_id: string | null;
};

/**
 * Public payment-status poll. Gated by `order_id` as a knowledge proof
 * — the marketing widget receives both ids in the same response, so
 * legitimate clients can poll without auth, but anonymous enumerators
 * can't read someone else's payment.
 */
export async function fetchPublicPaymentStatus(args: {
  paymentId: string;
  razorpayOrderId: string;
}): Promise<{
  id: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  booking_id: string | null;
  captured_at: string | null;
}> {
  return publicFetch(
    `/v1/payments/${args.paymentId}/public?order_id=${encodeURIComponent(args.razorpayOrderId)}`,
  );
}

// ===== S6-11: public tournament =====

export type PublicTournament = {
  id: string;
  name: string;
  slug: string;
  venue: string | null;
  venue_address: string | null;
  start_date: string;
  end_date: string;
  reg_open_at: string;
  reg_close_at: string;
  banner_storage_key: string | null;
  description: string | null;
  rules_md: string | null;
  prize_pool: number | null;
  status: "published" | "in_progress" | "completed";
  /** Admin closed the registration form — surfaces show a community CTA instead. */
  registration_closed?: boolean;
};

export type PublicTournamentCategory = {
  id: string;
  skill_level: "amateur" | "intermediate" | "advanced" | "open";
  gender: "men" | "women" | "mixed" | "open";
  play_type: "singles" | "doubles";
  pricing_mode: "per_head" | "per_team";
  entry_fee: number;
  early_bird_fee: number | null;
  early_bird_slots: number | null;
  early_bird_remaining: number | null;
  early_bird_active: boolean;
  current_price: number;
  dupr_cap_max: number | null;
  max_registrations: number;
  schedule_date: string | null;
  status: string;
  confirmed_count: number;
};

export async function fetchPublicTournament(slug: string): Promise<{
  tournament: PublicTournament;
  categories: PublicTournamentCategory[];
} | null> {
  try {
    return await publicFetch<{
      tournament: PublicTournament;
      categories: PublicTournamentCategory[];
    }>(`/v1/tournaments/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiHttpError && err.status === 404) return null;
    throw err;
  }
}

/** Upcoming + live events (published / in_progress), soonest first. */
export type PublicEventSummary = {
  slug: string;
  name: string;
  venue: string | null;
  start_date: string;
  end_date: string;
  reg_open_at: string;
  reg_close_at: string;
  banner_storage_key: string | null;
  from_fee: number;
  status: "published" | "in_progress";
};

export async function fetchPublicEvents(): Promise<PublicEventSummary[]> {
  try {
    const res = await publicFetch<{ events: PublicEventSummary[] }>("/v1/public/events");
    return res.events;
  } catch {
    // A listing that can't load renders its empty state, never a crash.
    return [];
  }
}

// ===== Public event registration (DUPR Night & friends) =====

export type EventRegisterResponse = {
  registration_id: string;
  registration_ids?: string[];
  status: "pending" | "confirmed";
  payment: {
    payment_id: string;
    razorpay_order_id: string;
    razorpay_key_id: string;
    amount_paise: number;
    currency: "INR";
  } | null;
  replayed: boolean;
};

export type EventPersonGender = "male" | "female" | "other";

export type EventUtm = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  src?: string;
  ref?: string;
  landing?: string;
};

export type EventRegistrant = {
  full_name: string;
  phone: string;
  gender?: EventPersonGender;
  dupr_id?: string;
  dupr_rating?: number;
};

export async function registerForEvent(input: {
  slug: string;
  body: {
    category_id?: string;
    category_ids?: string[];
    team_name?: string;
    registrant: EventRegistrant;
    partner?: Partial<EventRegistrant>;
    /** Solo doubles entry — organiser pairs the player; partner omitted. */
    needs_partner?: boolean;
    self_declared_skill?: "amateur" | "intermediate" | "advanced" | "open";
    regular_at_pc?: boolean;
    terms_accepted?: boolean;
    coupon_code?: string;
    whatsapp_opt_in?: boolean;
    utm?: EventUtm;
  };
  idempotencyKey: string;
}): Promise<EventRegisterResponse> {
  return publicFetch<EventRegisterResponse>(
    `/v1/public/events/${encodeURIComponent(input.slug)}/register`,
    {
      method: "POST",
      headers: { "Idempotency-Key": input.idempotencyKey },
      body: JSON.stringify(input.body),
    },
  );
}

export type EventCouponPreview =
  | {
      valid: true;
      code: string;
      description: string | null;
      base_paise: number;
      discount_paise: number;
      final_paise: number;
    }
  | { valid: false; code: string; message: string };

/** Preview a discount code against an event's selected category (no auth). */
export async function previewEventCoupon(input: {
  slug: string;
  code: string;
  categoryId: string;
}): Promise<EventCouponPreview> {
  return publicFetch<EventCouponPreview>(
    `/v1/public/events/${encodeURIComponent(input.slug)}/coupon`,
    {
      method: "POST",
      body: JSON.stringify({ code: input.code, category_id: input.categoryId }),
    },
  );
}

/**
 * Confirm an event payment synchronously from the Razorpay Checkout handler
 * (no webhook needed). Verifies the success signature server-side.
 */
export async function verifyEventPayment(input: {
  paymentId: string;
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  idempotencyKey: string;
}): Promise<{ status: "captured"; registration_ids: string[]; replayed: boolean }> {
  return publicFetch(`/v1/public/events/payments/verify`, {
    method: "POST",
    headers: { "Idempotency-Key": input.idempotencyKey },
    body: JSON.stringify({
      payment_id: input.paymentId,
      razorpay_order_id: input.razorpayOrderId,
      razorpay_payment_id: input.razorpayPaymentId,
      razorpay_signature: input.razorpaySignature,
    }),
  });
}

// ===== S7-11: Public challenge =====

export type PublicChallenge = {
  challenge: {
    slug: string;
    play_type: "singles" | "doubles";
    stake_type: "friendly" | "rated" | "wager_credits";
    status:
      | "open"
      | "matched"
      | "scheduled"
      | "live"
      | "completed"
      | "disputed"
      | "expired"
      | "cancelled";
    created_at: string;
    scheduled_at: string | null;
    completed_at: string | null;
    court_name: string | null;
  };
  participants: { full_name: string; side: number; role: "captain" | "partner" }[];
  result: {
    winner_side: number;
    side1_games: number;
    side2_games: number;
    games: { side1_score: number; side2_score: number }[];
    elo_change_side1: string | null;
    elo_change_side2: string | null;
    applied_at: string | null;
  } | null;
};

export async function fetchPublicChallenge(slug: string): Promise<PublicChallenge | null> {
  try {
    return await publicFetch<PublicChallenge>(`/v1/public/challenges/${encodeURIComponent(slug)}`);
  } catch (err) {
    if (err instanceof ApiHttpError && err.status === 404) return null;
    throw err;
  }
}

// ===== Coaching (public: the same plans + slot window the app shows) =====

export type CoachingPlan = {
  id: string;
  name: string;
  description: string | null;
  duration: "single" | "monthly" | "quarterly" | "half_yearly" | "annually" | string;
  price_paise: number;
};

export async function fetchPublicCoaching(): Promise<{ plans: CoachingPlan[]; slot_hours: number[] } | null> {
  try {
    return await publicFetch<{ plans: CoachingPlan[]; slot_hours: number[] }>("/v1/public/coaching");
  } catch {
    return null;
  }
}

/** The app's own duration labels (CoachingScreen.coachingDurationLabel). */
export const coachingFrequency = (d: string): string =>
  d === "single" ? "Single session" : d === "monthly" ? "Monthly" : d === "quarterly" ? "Quarterly" : d === "half_yearly" ? "6-month" : "Annual";

/** 16 → "4–5 PM" (as the app labels a slot). */
export const hourLabel = (h: number): string => {
  const f = (x: number) => ({ hr: x % 12 === 0 ? 12 : x % 12, ap: x < 12 || x === 24 ? "AM" : "PM" });
  const a = f(h);
  const b = f((h + 1) % 24);
  return a.ap === b.ap ? `${a.hr}–${b.hr} ${a.ap}` : `${a.hr} ${a.ap}–${b.hr} ${b.ap}`;
};
