/**
 * DEMO BACKEND — the static GitHub Pages mock only (NEXT_PUBLIC_DEMO=1).
 * Answers the website's API calls from sample data kept in this browser's
 * localStorage. Nothing leaves the device: no real bookings, no payments,
 * no SMS/email. Court rules mirror the real API (inclusive end, early
 * check-in 10 min, server-style session timer).
 */
import { MEMBERSHIP_PLANS } from "./membership-plans";

export const DEMO = process.env.NEXT_PUBLIC_DEMO === "1";

type Booking = {
  id: string;
  number: string;
  kind: "court" | "membership" | "coaching";
  courtNumber: number;
  date: string;
  start: string;
  end: string;
  status: "held" | "confirmed" | "checked_in" | "cancelled";
  total: number;
  checkInAt: string | null;
  label?: string;
};
type User = { id: string; phone: string; email: string; full_name: string; profile_completed: boolean };
type Store = { users: Record<string, User>; bookings: Booking[]; seq: number };

const KEY = "pc_demo_v1";
const IST = 330 * 60_000;
const PRICE = 600;
const SLOT_HOURS = [16, 17, 18, 19];
const COACHING = [
  { id: "demo-coach-monthly", name: "Monthly", description: "Your daily coaching slot for a month.", duration: "monthly", price_paise: 300000 },
  { id: "demo-coach-quarterly", name: "Quarterly", description: "3 months of coaching — best value.", duration: "quarterly", price_paise: 800000 },
  { id: "demo-coach-single", name: "Single session", description: "One 1-hour session — new tricks, drills, injury recovery.", duration: "single", price_paise: 60000 },
];
const PERIOD: Record<string, string> = { monthly: "monthly", quarterly: "quarterly", "half-yearly": "half_yearly", yearly: "annually" };

function read(): Store {
  if (typeof localStorage === "undefined") return { users: {}, bookings: [], seq: 1 };
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "") as Store;
  } catch {
    return { users: {}, bookings: [], seq: 1 };
  }
}
function write(s: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    /* private mode */
  }
}
const istNow = () => new Date(Date.now() + IST);
const today = () => istNow().toISOString().slice(0, 10);
const toMin = (t: string) => Number(t.slice(0, 2)) * 60 + Number(t.slice(3, 5));
const fromMin = (m: number) => `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`;
const instant = (d: string, t: string) => new Date(`${d}T${t}:00+05:30`).getTime();
const tokenUser = (init: RequestInit) => {
  const h = new Headers(init.headers).get("authorization") ?? "";
  return h.startsWith("Bearer demo:") ? h.slice("Bearer demo:".length) : null;
};

/** Stable pseudo-random "already booked" cells so the grid looks lived-in. */
function takenBySomeoneElse(date: string, court: number, m: number): boolean {
  let h = 0;
  for (const c of `${date}|${court}|${Math.floor(m / 60)}`) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return h % 5 === 0;
}

function grid(date: string) {
  const s = read();
  const now = date === today() ? istNow().getUTCHours() * 60 + istNow().getUTCMinutes() : -1;
  const courts = [1, 2, 3, 4].map((n) => ({ id: `court-${n}`, name: `Court ${n}`, court_number: n, surface_type: "cushioned_acrylic", status: "available" }));
  const cells = [];
  for (const c of courts) {
    for (let m = 6 * 60; m < 23 * 60; m += 30) {
      const mine = s.bookings.some((b) => b.kind === "court" && b.date === date && b.courtNumber === c.court_number && b.status !== "cancelled" && toMin(b.start) <= m && m < toMin(b.end));
      cells.push({
        court_id: c.id,
        start_time: fromMin(m),
        end_time: fromMin(m + 30),
        status: m < now ? "past" : mine || takenBySomeoneElse(date, c.court_number, m) ? "booked" : "free",
        is_peak: false,
        price_per_hour: PRICE,
      });
    }
  }
  return { date, slot_minutes: 30, courts, cells, generated_at: new Date().toISOString() };
}

function session(b: Booking) {
  const start = instant(b.date, b.start);
  const end = instant(b.date, b.end);
  const t = Date.now();
  const checked = b.checkInAt ? Date.parse(b.checkInAt) : null;
  const state =
    b.status === "held" ? "unpaid"
      : b.status === "cancelled" ? "cancelled"
        : checked ? (t >= end ? "ended" : t < start ? "checked_in_early" : "active")
          : t >= start + 15 * 60_000 ? "no_show"
            : t < start - 10 * 60_000 ? "upcoming" : "check_in_open";
  return {
    booking_id: b.id,
    booking_number: b.number,
    booking_status: b.status,
    state,
    court_numbers: [b.courtNumber],
    scheduled_start: new Date(start).toISOString(),
    scheduled_end: new Date(end).toISOString(),
    check_in_opens_at: new Date(start - 10 * 60_000).toISOString(),
    checked_in_at: b.checkInAt,
    check_in_method: b.checkInAt ? "qr" : null,
    timer_starts_at: checked ? new Date(Math.max(checked, start)).toISOString() : null,
    remaining_seconds: state === "active" ? Math.floor((end - t) / 1000) : 0,
    total_seconds: Math.floor((end - start) / 1000),
    server_now: new Date().toISOString(),
  };
}

export class DemoError extends Error {
  constructor(readonly status: number, readonly code: string, message: string) {
    super(message);
  }
}

const tokens = (u: User) => ({ kind: "tokens", access_token: `demo:${u.id}`, refresh_token: "demo", expires_in: 3600, user: u });

/** Resolve one API call against the demo store. */
export async function demoFetch(path: string, init: RequestInit = {}): Promise<unknown> {
  const method = (init.method ?? "GET").toUpperCase();
  const url = new URL(path, "https://demo.invalid");
  const p = url.pathname;
  const body = (init.body ? JSON.parse(String(init.body)) : {}) as Record<string, unknown>;
  const s = read();
  const uid = tokenUser(init);
  const me = uid ? s.users[uid] : undefined;
  const need = () => {
    if (!me) throw new DemoError(401, "unauthorized", "Please sign in again.");
    return me;
  };
  const save = () => write(s);
  const newId = (prefix: string) => `${prefix}-${s.seq++}`;

  if (method === "GET" && p === "/v1/facility/grid") return grid(url.searchParams.get("date") ?? today());
  if (method === "GET" && p === "/v1/public/events") return { events: [] };
  if (method === "GET" && p === "/v1/public/coaching") return { plans: COACHING, slot_hours: SLOT_HOURS };

  if (p === "/v1/auth/otp/sms/request") return { ok: true, req_id: "demo" };
  if (p === "/v1/auth/otp/sms/verify") {
    if (!/^\d{4,6}$/.test(String(body.code))) throw new DemoError(400, "otp_invalid", "That code isn't right.");
    const phone = String(body.phone);
    let u = Object.values(s.users).find((x) => x.phone === phone);
    if (!u) {
      u = { id: newId("u"), phone, email: `${phone.replace(/\D/g, "")}@phone.pickleball-central.co.in`, full_name: "Player", profile_completed: false };
      s.users[u.id] = u;
    }
    save();
    return tokens(u);
  }
  if (p === "/v1/auth/refresh" || p === "/v1/auth/logout") throw new DemoError(401, "signed_out", "Signed out");
  if (method === "GET" && p === "/v1/users/me") return need();
  if (p === "/v1/users/me/contact") {
    const u = need();
    const email = String(body.email).trim().toLowerCase();
    if (Object.values(s.users).some((x) => x.email === email && x.id !== u.id)) {
      throw new DemoError(409, "email_linked_to_other_account", "This email is already on another account. We never merge accounts automatically.");
    }
    Object.assign(u, { email, full_name: String(body.full_name).trim(), profile_completed: true });
    save();
    return u;
  }

  if (p === "/v1/memberships/me") {
    need();
    const m = s.bookings.find((b) => b.kind === "membership" && b.status === "confirmed" && b.label?.startsWith(me!.id));
    return { membership: m ? { plan_name: m.label?.split("|")[1] } : null };
  }
  if (p === "/v1/membership-plans") {
    need();
    return { plans: MEMBERSHIP_PLANS.map((m) => ({ id: `demo-plan-${m.id}`, billing_period: PERIOD[m.id], price_paise: Number(m.price.replace(/\D/g, "")) * 100 })) };
  }
  if (p === "/v1/promos/validate") throw new DemoError(400, "promo_invalid", "Promo codes aren't available in this mock.");

  const intentFor = (b: Booking) => ({ payment_id: b.id, razorpay_order_id: `order_stub_${b.id}`, razorpay_key_id: "rzp_test_stub", amount_paise: Math.round(b.total * 100) });
  if (p === "/v1/bookings" && method === "POST") {
    const u = need();
    const slot = (body.slots as { court_id: string; date: string; start_time: string; end_time: string }[])[0]!;
    const n = Number(slot.court_id.replace("court-", ""));
    const clash = grid(slot.date).cells.some((c) => c.court_id === slot.court_id && c.status !== "free" && toMin(c.start_time) >= toMin(slot.start_time) && toMin(c.start_time) < toMin(slot.end_time));
    if (clash) throw new DemoError(409, "slot_conflict", "That slot was just booked — please pick another.");
    const hours = (toMin(slot.end_time) - toMin(slot.start_time)) / 60;
    const net = PRICE * hours;
    const total = process.env.NEXT_PUBLIC_COURT_GST_MODE === "exclusive" ? Math.round(net * 1.18 * 100) / 100 : net;
    const b: Booking = { id: newId("b"), number: `PC-DEMO-${String(s.seq).padStart(4, "0")}`, kind: "court", courtNumber: n, date: slot.date, start: slot.start_time, end: slot.end_time, status: "held", total, checkInAt: null, label: u.id };
    s.bookings.push(b);
    save();
    return { booking: { id: b.id, booking_number: b.number, total_amount: total, discount_amount: null, free_hours_applied: null, member_rate_applied: false }, hold_expires_in_seconds: 300 };
  }
  if (p === "/v1/payments/intent") {
    need();
    const b = s.bookings.find((x) => x.id === body.owning_id);
    if (!b) throw new DemoError(404, "not_found", "Booking not found");
    return intentFor(b);
  }
  if (p === "/v1/memberships/subscribe") {
    const u = need();
    const plan = MEMBERSHIP_PLANS.find((m) => `demo-plan-${m.id}` === body.plan_id)!;
    const b: Booking = { id: newId("m"), number: `PCM-DEMO-${s.seq}`, kind: "membership", courtNumber: 0, date: today(), start: "00:00", end: "00:00", status: "held", total: Number(plan.price.replace(/\D/g, "")), checkInAt: null, label: `${u.id}|${plan.name}` };
    s.bookings.push(b);
    save();
    return intentFor(b);
  }
  if (p === "/v1/coaching/enroll") {
    need();
    const plan = COACHING.find((c) => c.id === body.coaching_plan_id)!;
    const b: Booking = { id: newId("k"), number: `PCC-DEMO-${s.seq}`, kind: "coaching", courtNumber: 0, date: today(), start: "00:00", end: "00:00", status: "held", total: plan.price_paise / 100, checkInAt: null };
    s.bookings.push(b);
    save();
    return intentFor(b);
  }
  if (p === "/v1/dev/razorpay/checkout") {
    if (body.outcome === "failure") return { outcome: "failure" };
    const order = String(body.order_id);
    return { outcome: "success", razorpay_order_id: order, razorpay_payment_id: `pay_${order}`, razorpay_signature: "demo-signature" };
  }
  const verified = p.match(/^\/v1\/(?:payments|memberships\/payments|coaching\/payments)\/([^/]+)\/verify$/);
  if (verified) {
    need();
    const b = s.bookings.find((x) => x.id === verified[1]);
    if (!b) throw new DemoError(404, "not_found", "Payment not found");
    b.status = "confirmed";
    save();
    return { status: "captured", booking_id: b.id, booking_status: "confirmed" };
  }

  const sess = p.match(/^\/v1\/bookings\/([^/]+)\/(session|check-in)$/);
  if (sess) {
    const u = need();
    const b = s.bookings.find((x) => x.id === sess[1] && x.label === u.id);
    if (!b) throw new DemoError(404, "not_found", "Booking not found");
    if (sess[2] === "check-in") {
      const v = session(b);
      if (b.status === "held") throw new DemoError(409, "payment_not_verified", "This booking isn't paid yet.");
      if (v.state === "upcoming") throw new DemoError(409, "too_early", "Check-in opens 10 minutes before your booking.");
      if (Date.now() >= instant(b.date, b.end)) throw new DemoError(409, "booking_ended", "This booking has already ended.");
      if (!b.checkInAt) {
        b.checkInAt = new Date().toISOString();
        b.status = "checked_in";
        save();
      }
    }
    return session(b);
  }
  if (p === "/v1/bookings/me/sessions") {
    const u = need();
    let list = s.bookings.filter((b) => b.kind === "court" && b.label === u.id && b.date === today() && b.status !== "cancelled" && b.status !== "held");
    if (list.length === 0) {
      // Mock only: a sample booking that started 8 minutes ago, so the
      // check-in → live timer journey can be tried at any time of day.
      const m = istNow().getUTCHours() * 60 + istNow().getUTCMinutes() - 8;
      const b: Booking = { id: newId("b"), number: `PC-DEMO-SAMPLE`, kind: "court", courtNumber: 2, date: today(), start: fromMin(m), end: fromMin(m + 60), status: "confirmed", total: 708, checkInAt: null, label: u.id };
      s.bookings.push(b);
      save();
      list = [b];
    }
    return { sessions: list.map(session), server_now: new Date().toISOString() };
  }
  if (p === "/v1/bookings/me") {
    const u = need();
    return {
      bookings: s.bookings
        .filter((b) => b.kind === "court" && b.label === u.id && b.status !== "held")
        .map((b) => ({ id: b.id, booking_number: b.number, status: b.status, total_amount: b.total, court_number: b.courtNumber, date: b.date, start_time: b.start, end_time: b.end })),
    };
  }
  if (/^\/v1\/bookings\/[^/]+\/confirm-free$/.test(p)) return { ok: true };

  throw new DemoError(404, "not_in_mock", "That isn't part of this mock.");
}
