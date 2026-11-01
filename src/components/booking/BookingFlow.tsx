"use client";

/**
 * /play — the one booking flow for the website and the venue QR code (both
 * open /play; nothing is preselected from a scan). Three steps, mirroring the
 * app: Court → Date & time → Checkout, then the confirmation page.
 *
 * Checkout uses the SAME backend as the app: the customer signs in with their
 * phone (their one account), POST /v1/bookings holds the slots for the
 * server's hold time, POST /v1/payments/intent opens Razorpay prefilled, and
 * POST /v1/payments/:id/verify confirms server-side. Member free hours and
 * promo codes are applied by the server and shown from its figures. A hold is
 * never shown as a booking; only a verified payment (or a free member
 * booking) reaches the confirmation page.
 */
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

import { ContactDetails } from "@/components/checkout/ContactDetails";
import { formatPhone } from "@/components/checkout/CustomerDetails";
import { Icon } from "@/components/site/Icon";
import { track } from "@/lib/analytics";
import { ApiHttpError, type FacilityGrid, fetchFacilityGrid } from "@/lib/api";
import { authFetch, type Me } from "@/lib/auth";
import {
  courtLook,
  dayPart,
  DURATIONS,
  durationLabel,
  GST_EXCLUSIVE,
  gstIncluded,
  payable,
  nextDays,
  type StartOption,
  startOptions,
  time12,
} from "@/lib/booking";
import { type Intent, isDevIntent, pay as runPayment, simulate, verify } from "@/lib/checkout";
import { friendlyError } from "@/lib/friendly-error";

import { btnPrimary, btnSecondary, SampleBadge } from "../site/ui";
import { CourtMap } from "./CourtMap";

type Step = "court" | "time" | "checkout";
const STEPS: { id: Step; label: string }[] = [
  { id: "court", label: "Court" },
  { id: "time", label: "Date & time" },
  { id: "checkout", label: "Review & checkout" },
];
const POLL_MS = 30_000;
const DAYS_AHEAD = 14;

export function BookingFlow({
  today,
  rebook,
}: {
  today: string;
  /** From My Bookings → Rebook: court number and minutes, re-validated here. */
  rebook: { court: number; duration: number } | null;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState<Step>("court");
  const [date, setDate] = useState(today);
  const [grid, setGrid] = useState<FacilityGrid | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [courtId, setCourtId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number>(
    rebook && (DURATIONS as readonly number[]).includes(rebook.duration) ? rebook.duration : 60,
  );
  const [start, setStart] = useState<StartOption | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const rebookApplied = useRef(false);
  const autoAdvanced = useRef(false);

  const load = useCallback(async () => {
    try {
      setGrid(await fetchFacilityGrid(date));
      setLoadError(null);
    } catch (err) {
      setLoadError(friendlyError(err, "Couldn't load availability. Please try again."));
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    setLoading(true);
    void load();
    const id = setInterval(() => {
      if (document.visibilityState === "visible") void load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [load]);

  const court = grid?.courts.find((c) => c.id === courtId) ?? null;
  const options = useMemo(
    () => (grid && courtId ? startOptions(grid, courtId, duration) : []),
    [grid, courtId, duration],
  );

  // A chosen time that stops being free is dropped with a note — but never
  // mid-checkout, where the server hold (not the grid) is the truth.
  useEffect(() => {
    if (step === "checkout" || !start || !grid || grid.date !== date) return;
    if (!options.some((o) => o.start === start.start && o.end === start.end)) {
      setNotice(`${time12(start.start)} is no longer free for ${durationLabel(duration)}. Pick another time.`);
      setStart(null);
    }
  }, [options, start, grid, date, duration, step]);

  useEffect(() => {
    if (autoAdvanced.current || !grid || grid.date !== today || rebook) return;
    autoAdvanced.current = true;
    if (grid.courts.every((c) => courtLook(grid, c).look !== "available")) {
      setDate(nextDays(today, 2)[1]!);
      setNotice("Today is fully booked, so we're showing tomorrow.");
    }
  }, [grid, today, rebook]);

  useEffect(() => {
    if (!rebook || rebookApplied.current || !grid) return;
    rebookApplied.current = true;
    const c = grid.courts.find((x) => x.court_number === rebook.court);
    if (c && c.status === "available") {
      setCourtId(c.id);
      setNotice(`Rebooking Court ${c.court_number} for ${durationLabel(duration)}. Pick a day and time.`);
      go("time");
    } else {
      setNotice(`Court ${rebook.court} can't be booked right now. Please choose another court.`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grid, rebook]);

  const go = useCallback(
    (s: Step) => {
      setStep(s);
      window.history.pushState({ step: s }, "");
      window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    },
    [reduce],
  );
  // Step entries go through Next's patched pushState (it copies its router
  // marker onto them); the first entry is left untouched. No `step` = court.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { step?: Step } | null)?.step;
      setStep(s && STEPS.some((x) => x.id === s) ? s : "court");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const dayLabel = date === today ? "today" : shortDay(date);
  const price = start?.price ?? 0;
  const stepIndex = STEPS.findIndex((s) => s.id === step);

  return (
    <div className="mx-auto max-w-6xl px-4 pb-32 sm:px-6 lg:pb-20">
      <Progress index={stepIndex} />

      {notice ? (
        <div
          role="status"
          className="mb-5 flex items-start justify-between gap-3 rounded-2xl border border-[#C8F400]/30 bg-[#C8F400]/[0.06] px-4 py-3 text-sm text-[#E2E8F0]"
        >
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice(null)} className="shrink-0 text-[#94A3B8] hover:text-white" aria-label="Dismiss">
            <Icon name="close" />
          </button>
        </div>
      ) : null}

      <div className={`grid gap-8 ${step === "court" ? "" : "lg:grid-cols-[1fr_22rem]"}`}>
        <div className="min-w-0">
          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={step}
              aria-labelledby="step-title"
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            >
              {step === "court" ? (
                <StepCourt
                  grid={grid}
                  loading={loading}
                  error={loadError}
                  onRetry={() => void load()}
                  courtId={courtId}
                  dayLabel={dayLabel}
                  onSelect={(id) => {
                    if (id !== courtId) setStart(null);
                    setCourtId(id);
                    const n = grid?.courts.find((c) => c.id === id)?.court_number;
                    track("ViewContent", { content_type: "court_slot", content_name: `Court ${n ?? ""}`, currency: "INR" });
                    go("time");
                  }}
                />
              ) : null}

              {step === "time" && court ? (
                <StepTime
                  today={today}
                  date={date}
                  setDate={(d) => {
                    setDate(d);
                    setStart(null);
                  }}
                  duration={duration}
                  setDuration={(m) => {
                    setDuration(m);
                    setStart(null);
                  }}
                  courtNumber={court.court_number}
                  options={grid?.date === date ? options : null}
                  loading={loading}
                  error={loadError}
                  start={start}
                  setStart={(o) => {
                    setNotice(null);
                    setStart(o);
                  }}
                  onChangeCourt={() => go("court")}
                />
              ) : null}

              {step === "checkout" && court && start ? (
                <StepCheckout
                  courtId={court.id}
                  courtNumber={court.court_number}
                  date={date}
                  start={start}
                  duration={duration}
                  onEdit={go}
                  onSlotLost={() => {
                    setStart(null);
                    void load();
                    setNotice("That time was just taken. Here's what's still free.");
                    go("time");
                  }}
                />
              ) : null}

              {(step === "time" && !court) || (step === "checkout" && (!court || !start)) ? (
                <div className="rounded-2xl border border-white/10 p-6">
                  <p className="text-white">Let&rsquo;s start with a court.</p>
                  <button type="button" className={`${btnPrimary} mt-4`} onClick={() => go("court")}>
                    Choose a court
                  </button>
                </div>
              ) : null}
            </motion.section>
          </AnimatePresence>
        </div>

        {step !== "court" ? (
          <Summary
            courtNumber={court?.court_number ?? null}
            date={date}
            start={start}
            duration={duration}
            step={step}
            price={price}
            canContinue={Boolean(start)}
            onContinue={() => go("checkout")}
          />
        ) : null}
      </div>
    </div>
  );
}

// ── Step 1: court ──────────────────────────────────────────────────────

function StepCourt({
  grid,
  loading,
  error,
  onRetry,
  courtId,
  dayLabel,
  onSelect,
}: {
  grid: FacilityGrid | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  courtId: string | null;
  dayLabel: string;
  onSelect: (id: string) => void;
}) {
  // Each court carries its own availability: free 1-hour starts for the shown day.
  const courts = (grid?.courts ?? []).map((c) => {
    const { look, free } = courtLook(grid!, c);
    return {
      id: c.id,
      number: c.court_number,
      look: c.id === courtId && look !== "closed" ? ("selected" as const) : look,
      detail: look === "closed" ? "Closed" : free ? `${free} slot${free === 1 ? "" : "s"} available ${dayLabel}` : `Full ${dayLabel}`,
    };
  });
  return (
    <div className="mx-auto w-full max-w-[520px]">
      {/* The map carries the visible title, as in the app. */}
      <h1 id="step-title" className="sr-only">
        Step 1: Choose your court
      </h1>
      <CourtMap courts={courts} onSelect={onSelect} dayLabel={dayLabel} loading={loading && !grid} />
      {error ? <ErrorBox message={error} onRetry={onRetry} /> : null}
    </div>
  );
}

function StepTime({
  today,
  date,
  setDate,
  duration,
  setDuration,
  courtNumber,
  options,
  loading,
  error,
  start,
  setStart,
  onChangeCourt,
}: {
  today: string;
  date: string;
  setDate: (d: string) => void;
  duration: number;
  setDuration: (m: number) => void;
  courtNumber: number;
  options: StartOption[] | null;
  loading: boolean;
  error: string | null;
  start: StartOption | null;
  setStart: (o: StartOption) => void;
  onChangeCourt: () => void;
}) {
  const days = nextDays(today, DAYS_AHEAD);
  const groups = new Map<string, StartOption[]>();
  for (const o of options ?? [])
    groups.set(dayPart(o.start), [...(groups.get(dayPart(o.start)) ?? []), o]);

  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <StepTitle n={2}>Date &amp; time</StepTitle>
        <button
          type="button"
          onClick={onChangeCourt}
          className="rounded-full border border-white/15 px-3 py-1.5 text-sm text-white hover:border-white/35"
        >
          Court {courtNumber} · Change
        </button>
      </div>

      <fieldset className="mt-6 min-w-0">
        <legend className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
          Day
        </legend>
        <div className="-mx-4 mt-2 flex snap-x gap-2 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 [scrollbar-width:none]">
          {days.map((d, i) => {
            const on = d === date;
            const dt = new Date(`${d}T12:00:00+05:30`);
            return (
              <button
                key={d}
                type="button"
                aria-pressed={on}
                onClick={() => setDate(d)}
                className={`flex h-[68px] w-[60px] shrink-0 snap-start flex-col items-center justify-center rounded-2xl border transition-colors ${
                  on
                    ? "border-[#C8F400] bg-[#C8F400] text-[#0A0F1E]"
                    : "border-white/10 text-white hover:border-white/30"
                }`}
              >
                <span className={`text-[11px] font-medium ${on ? "" : "text-[#94A3B8]"}`}>
                  {i === 0
                    ? "Today"
                    : dt.toLocaleDateString("en-IN", {
                        weekday: "short",
                        timeZone: "Asia/Kolkata",
                      })}
                </span>
                <span className="font-display text-2xl font-bold leading-none">
                  {dt.getUTCDate()}
                </span>
                <span className={`text-[11px] ${on ? "" : "text-[#94A3B8]"}`}>
                  {dt.toLocaleDateString("en-IN", { month: "short", timeZone: "Asia/Kolkata" })}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-5 min-w-0">
        <legend className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
          How long
        </legend>
        <div className="-mx-4 mt-2 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0 [scrollbar-width:none]">
          {DURATIONS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={m === duration}
              onClick={() => setDuration(m)}
              className={`h-10 shrink-0 rounded-full border px-4 text-sm font-medium transition-colors ${
                m === duration
                  ? "border-[#C8F400] bg-[#C8F400]/15 text-[#C8F400]"
                  : "border-white/10 text-[#CBD5E1] hover:border-white/30"
              }`}
            >
              {durationLabel(m)}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-6" aria-live="polite">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
          Start time
        </p>
        {error ? <ErrorBox message={error} /> : null}
        {options === null || (loading && !options.length) ? (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="h-[58px] animate-pulse rounded-xl bg-white/[0.05] motion-reduce:animate-none"
              />
            ))}
          </div>
        ) : options.length === 0 ? (
          <div className="mt-3 rounded-2xl border border-dashed border-white/15 p-5">
            <p className="font-semibold text-white">
              No {durationLabel(duration)} slots left on Court {courtNumber}{" "}
              {date === today ? "today" : shortDay(date)}.
            </p>
            <p className="mt-1 text-sm text-[#94A3B8]">
              Try a shorter booking, another day, or another court.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {duration > 60 ? (
                <button type="button" className={btnSecondary} onClick={() => setDuration(60)}>
                  Try 1 hr
                </button>
              ) : null}
              <button type="button" className={btnSecondary} onClick={onChangeCourt}>
                Other courts
              </button>
            </div>
          </div>
        ) : (
          (["Morning", "Afternoon", "Evening"] as const).map((part) =>
            groups.get(part)?.length ? (
              <div key={part} className="mt-4">
                <p className="text-sm font-medium text-[#CBD5E1]">{part}</p>
                <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                  {groups.get(part)!.map((o) => {
                    const on = start?.start === o.start;
                    return (
                      <button
                        key={o.start}
                        type="button"
                        aria-pressed={on}
                        onClick={() => setStart(o)}
                        className={`flex h-[58px] flex-col items-center justify-center rounded-xl border transition-colors ${
                          on
                            ? "border-[#C8F400] bg-[#C8F400] text-[#0A0F1E]"
                            : "border-white/10 text-white hover:border-white/30"
                        }`}
                      >
                        <span className="text-[15px] font-semibold">{time12(o.start)}</span>
                        <span
                          className={`text-[11px] ${on ? "text-[#0A0F1E]/75" : "text-[#94A3B8]"}`}
                        >
                          ₹{o.price.toLocaleString("en-IN")}
                          {o.peak ? " · peak" : ""}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null,
          )
        )}
        <p className="mt-4 text-xs text-[#94A3B8]">
          {GST_EXCLUSIVE ? "Prices are per court for the whole booking, plus 18% GST." : "Prices are per court for the whole booking, including GST."}
        </p>
      </div>
    </div>
  );
}


// ── Step 3: checkout (summary + details + pay, one screen) ─────────────

type Hold = {
  booking: {
    id: string;
    booking_number: string;
    total_amount: number;
    discount_amount: number | null;
    free_hours_applied: number | null;
    member_rate_applied: boolean | null;
  };
  hold_expires_in_seconds: number;
};

type PayState =
  | { kind: "idle" }
  | { kind: "working"; label: string }
  | { kind: "dev"; hold: Hold; intent: Intent; until: number }
  | { kind: "retry"; hold: Hold; intent: Intent; until: number; message: string | null }
  | { kind: "failed"; message: string }
  | { kind: "expired" };

function StepCheckout({
  courtId,
  courtNumber,
  date,
  start,
  duration,
  onEdit,
  onSlotLost,
}: {
  courtId: string;
  courtNumber: number;
  date: string;
  start: StartOption;
  duration: number;
  onEdit: (s: Step) => void;
  onSlotLost: () => void;
}) {
  const [me, setMe] = useState<Me | null>(null);
  const onReady = useCallback((m: Me | null) => setMe(m), []);
  const [member, setMember] = useState<string | null>(null);
  const [accepted, setAccepted] = useState(false);
  const [promoOpen, setPromoOpen] = useState(false);
  const [promo, setPromo] = useState("");
  const [promoState, setPromoState] = useState<{ code: string; discount: number } | { error: string } | null>(null);
  const [pay, setPayState] = useState<PayState>({ kind: "idle" });
  const [now, setNow] = useState(Date.now());

  // Membership benefits are applied by the server at hold time; say so up front.
  useEffect(() => {
    if (!me) return setMember(null);
    authFetch<{ membership: { plan_name?: string; plan?: { name?: string } } | null }>("/v1/memberships/me")
      .then((r) => setMember(r.membership ? (r.membership.plan_name ?? r.membership.plan?.name ?? "Member") : null))
      .catch(() => setMember(null));
  }, [me]);

  const until = pay.kind === "dev" || pay.kind === "retry" ? pay.until : null;
  useEffect(() => {
    if (!until) return;
    const id = setInterval(() => {
      setNow(Date.now());
      if (Date.now() >= until) setPayState({ kind: "expired" });
    }, 1000);
    return () => clearInterval(id);
  }, [until]);

  const held = pay.kind === "dev" || pay.kind === "retry" ? pay.hold : null;
  const total = held ? held.booking.total_amount : payable(start.price - (promoState && "discount" in promoState ? promoState.discount : 0));
  const left = until ? Math.max(0, Math.ceil((until - now) / 1000)) : 0;
  const busy = pay.kind === "working" || pay.kind === "dev";

  const applyPromo = async () => {
    if (!promo.trim()) return;
    try {
      const r = await authFetch<{ code: string; discount_paise: number }>("/v1/promos/validate", {
        method: "POST",
        body: JSON.stringify({ code: promo.trim(), domain: "booking", amount_paise: Math.round(start.price * 100) }),
      });
      setPromoState({ code: r.code, discount: r.discount_paise / 100 });
    } catch (err) {
      setPromoState({ error: friendlyError(err, "That code isn't valid for this booking.") });
    }
  };

  const confirmed = (bookingId: string) => window.location.assign(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/play/confirmation?booking=${encodeURIComponent(bookingId)}`);

  const openPayment = async (hold: Hold, intent: Intent, untilMs: number) => {
    if (isDevIntent(intent)) return setPayState({ kind: "dev", hold, intent, until: untilMs });
    if (!me) return;
    setPayState({ kind: "working", label: "Waiting for payment…" });
    try {
      const out = await runPayment(
        intent,
        { name: me.full_name, email: me.email, contact: me.phone ?? "" },
        `Court ${courtNumber} · ${date} ${start.start}–${start.end}`,
        `/v1/payments/${intent.payment_id}/verify`,
      );
      if (out.kind === "paid") return confirmed(hold.booking.id);
      setPayState({ kind: "retry", hold, intent, until: untilMs, message: out.kind === "failed" ? out.message : null });
    } catch (err) {
      setPayState({ kind: "retry", hold, intent, until: untilMs, message: friendlyError(err, "Payment couldn't be confirmed. Try again.") });
    }
  };

  const startPayment = async () => {
    if (pay.kind === "retry") return openPayment(pay.hold, pay.intent, pay.until);
    track("InitiateCheckout", { currency: "INR", value: total, num_items: 1 });
    setPayState({ kind: "working", label: `Holding Court ${courtNumber}…` });
    try {
      const hold = await authFetch<Hold>("/v1/bookings", {
        method: "POST",
        body: JSON.stringify({
          slots: [{ court_id: courtId, date, start_time: start.start, end_time: start.end }],
          ...(promoState && "code" in promoState ? { promo_code: promoState.code } : {}),
        }),
      });
      const untilMs = Date.now() + Math.max(1, hold.hold_expires_in_seconds) * 1000;
      if (hold.booking.total_amount === 0) {
        // Fully covered (member free hours / promo): no payment, server confirms.
        await authFetch(`/v1/bookings/${hold.booking.id}/confirm-free`, { method: "POST", body: "{}" });
        return confirmed(hold.booking.id);
      }
      const intent = await authFetch<Intent>("/v1/payments/intent", {
        method: "POST",
        body: JSON.stringify({ purpose: "booking", owning_id: hold.booking.id }),
      });
      await openPayment(hold, intent, untilMs);
    } catch (err) {
      if (err instanceof ApiHttpError && (err.code === "slot_conflict" || err.code === "slot_taken")) {
        return onSlotLost();
      }
      setPayState({ kind: "failed", message: friendlyError(err, "Couldn't hold this court. Please try again.") });
    }
  };

  const devResult = async (outcome: "success" | "failure" | "close") => {
    if (pay.kind !== "dev") return;
    const { hold, intent, until: u } = pay;
    if (outcome === "close") return setPayState({ kind: "retry", hold, intent, until: u, message: null });
    setPayState({ kind: "working", label: "Confirming payment…" });
    try {
      const r = await simulate(intent, outcome);
      if (outcome === "failure" || !r.razorpay_signature) {
        return setPayState({ kind: "retry", hold, intent, until: u, message: "Payment failed. No money was taken for this attempt." });
      }
      await verify(`/v1/payments/${intent.payment_id}/verify`, {
        razorpay_payment_id: r.razorpay_payment_id!,
        razorpay_order_id: r.razorpay_order_id!,
        razorpay_signature: r.razorpay_signature,
      });
      confirmed(hold.booking.id);
    } catch (err) {
      setPayState({ kind: "retry", hold, intent, until: u, message: friendlyError(err, "Payment couldn't be confirmed.") });
    }
  };

  return (
    <div>
      <StepTitle n={3}>Review &amp; checkout</StepTitle>

      {/* One line: what they're buying. */}
      <div className="mt-5 flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-[#111827] px-4 py-3">
        <p className="text-sm text-white">
          <span className="font-semibold">Court {courtNumber}</span>
          <span className="text-[#CBD5E1]">
            {" · "}
            {shortDay(date)} · {time12(start.start)}–{time12(start.end)} ({durationLabel(duration)})
          </span>
        </p>
        <button type="button" disabled={busy || Boolean(held)} onClick={() => onEdit("time")} className="shrink-0 text-sm font-medium text-[#C8F400] hover:underline disabled:opacity-40">
          Edit
        </button>
      </div>

      <div className="mt-3">
        <ContactDetails onReady={onReady} />
      </div>

      {member ? (
        <p className="mt-3 flex items-center gap-2 rounded-xl border border-[#C8F400]/25 bg-[#C8F400]/[0.05] px-4 py-3 text-sm text-[#E2E8F0]">
          <Icon name="check" className="h-4 w-4 text-[#C8F400]" strokeWidth={3} />
          {member} membership: free hours or member rates apply automatically at payment.
        </p>
      ) : null}

      <dl className="mt-3 space-y-1.5 rounded-2xl border border-white/10 bg-[#111827] p-4 text-sm">
        {held && held.booking.discount_amount ? (
          <div className="flex justify-between text-[#CBD5E1]">
            <dt>{held.booking.free_hours_applied ? "Member free hours" : "Discount"}</dt>
            <dd>−₹{held.booking.discount_amount.toLocaleString("en-IN")}</dd>
          </div>
        ) : null}
        {!held && promoState && "discount" in promoState ? (
          <div className="flex justify-between text-[#CBD5E1]">
            <dt>Promo {promoState.code}</dt>
            <dd>−₹{promoState.discount.toLocaleString("en-IN")}</dd>
          </div>
        ) : null}
        <div className="flex items-baseline justify-between text-base font-semibold text-white">
          <dt>Total</dt>
          <dd className="font-display text-3xl">₹{total.toLocaleString("en-IN")}</dd>
        </div>
        <p className="text-right text-xs text-[#94A3B8]">incl. ₹{gstIncluded(total).toLocaleString("en-IN")} GST</p>
        {!held ? (
          promoOpen ? (
            <div className="flex gap-2 pt-2">
              <input
                aria-label="Promo code"
                value={promo}
                onChange={(e) => setPromo(e.target.value.toUpperCase())}
                disabled={!me}
                placeholder={me ? "PROMO CODE" : "Sign in to use a code"}
                className="h-10 min-w-0 flex-1 rounded-xl border border-white/15 bg-[#0F1525] px-3 text-sm uppercase text-white outline-none focus:border-[#C8F400]"
              />
              <button type="button" disabled={!me || !promo.trim()} onClick={() => void applyPromo()} className="h-10 rounded-full border border-white/15 px-4 text-sm text-white disabled:opacity-40">
                Apply
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => setPromoOpen(true)} className="pt-1 text-sm text-[#C8F400] hover:underline">
              Have a promo code?
            </button>
          )
        ) : null}
        {promoState && "error" in promoState ? <p className="text-xs text-[#FF9AA8]">{promoState.error}</p> : null}
      </dl>

      <label className="mt-4 flex items-start gap-3 text-sm text-[#CBD5E1]">
        <input type="checkbox" checked={accepted} disabled={busy} onChange={(e) => setAccepted(e.target.checked)} className="mt-0.5 h-5 w-5 shrink-0 accent-[#C8F400]" />
        <span>I agree to the cancellation policy: 100% refund &gt; 24h, 50% &gt; 12h, no refund within 12h.</span>
      </label>

      {pay.kind === "failed" ? <ErrorBox message={pay.message} /> : null}
      {pay.kind === "retry" ? (
        <p role="status" className="mt-4 rounded-xl border border-white/10 bg-white/[0.03] p-3 text-sm text-[#E2E8F0]">
          {pay.message ?? "Payment not completed."} Your court is held for {clock(left)} — you can try again.
        </p>
      ) : null}
      {pay.kind === "expired" ? (
        <div role="alert" className="mt-4 rounded-xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.08] p-4 text-sm text-[#FFD7DD]">
          The hold ran out before payment finished, so nothing was booked or charged.
          <button type="button" onClick={onSlotLost} className={`${btnSecondary} mt-3 w-full`}>
            Check availability again
          </button>
        </div>
      ) : null}

      {pay.kind === "dev" ? (
        <DevCheckout amount={total} left={left} me={me} onResult={(o) => void devResult(o)} />
      ) : pay.kind !== "expired" ? (
        <>
          <button
            type="button"
            disabled={!me || !accepted || pay.kind === "working"}
            onClick={() => void startPayment()}
            className={`${btnPrimary} mt-5 w-full`}
          >
            {pay.kind === "working" ? pay.label : pay.kind === "retry" ? "Try payment again" : `Pay ₹${total.toLocaleString("en-IN")}`}
          </button>
          <p className="mt-3 text-center text-xs text-[#94A3B8]">
            {me ? "Secure payment by Razorpay. Your court is confirmed only after payment is verified." : "Verify your details above to pay."}
          </p>
        </>
      ) : null}
    </div>
  );
}

/** LOCAL API ONLY (stub Razorpay): stands in for the Checkout popup. */
function DevCheckout({
  amount,
  left,
  me,
  onResult,
}: {
  amount: number;
  left: number;
  me: Me | null;
  onResult: (o: "success" | "failure" | "close") => void;
}) {
  return (
    <div role="dialog" aria-label="Simulated checkout" className="mt-5 rounded-2xl border border-amber-300/40 bg-[#14110A] p-5">
      <div className="flex items-center justify-between gap-2">
        <SampleBadge>Test payment · local API</SampleBadge>
        <span className="font-mono text-xs text-amber-100">Held {clock(left)}</span>
      </div>
      <p className="mt-3 text-sm text-[#E2E8F0]">
        Razorpay would open for <strong>₹{amount.toLocaleString("en-IN")}</strong>, prefilled with:
      </p>
      <dl className="mt-2 grid grid-cols-[5rem_1fr] gap-y-1 text-sm">
        <dt className="text-[#94A3B8]">name</dt>
        <dd className="text-white">{me?.full_name}</dd>
        <dt className="text-[#94A3B8]">email</dt>
        <dd className="break-all text-white">{me?.email}</dd>
        <dt className="text-[#94A3B8]">contact</dt>
        <dd className="text-white">{formatPhone(me?.phone)}</dd>
      </dl>
      <div className="mt-4 grid gap-2 sm:grid-cols-3">
        <button type="button" onClick={() => onResult("success")} className={btnPrimary}>
          Simulate paid
        </button>
        <button type="button" onClick={() => onResult("failure")} className={btnSecondary}>
          Simulate failure
        </button>
        <button type="button" onClick={() => onResult("close")} className={btnSecondary}>
          Close checkout
        </button>
      </div>
    </div>
  );
}

function Progress({ index }: { index: number }) {
  return (
    <nav aria-label="Booking steps" className="mb-6 pt-6 md:pt-10">
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#C8F400] md:hidden">
        Step {index + 1} of {STEPS.length} · {STEPS[index]?.label}
      </p>
      <ol className="mt-2 grid grid-cols-4 gap-1.5 md:mt-0 md:gap-3">
        {STEPS.map((s, i) => (
          <li key={s.id} aria-current={i === index ? "step" : undefined}>
            <span
              className={`block h-1 rounded-full transition-colors duration-300 ${i <= index ? "bg-[#C8F400]" : "bg-white/10"}`}
            />
            <span
              className={`mt-2 hidden text-sm md:block ${i === index ? "font-semibold text-white" : i < index ? "text-[#CBD5E1]" : "text-[#94A3B8]"}`}
            >
              {i + 1}. {s.label}
            </span>
          </li>
        ))}
      </ol>
    </nav>
  );
}

function StepTitle({ n, children }: { n: number; children: ReactNode }) {
  return (
    <h1
      id="step-title"
      className="font-display text-4xl font-extrabold uppercase leading-[0.95] text-white md:text-5xl"
    >
      <span className="sr-only">Step {n}: </span>
      {children}
    </h1>
  );
}

function Summary({
  courtNumber,
  date,
  start,
  duration,
  step,
  price,
  canContinue,
  onContinue,
}: {
  courtNumber: number | null;
  date: string;
  start: StartOption | null;
  duration: number;
  step: Step;
  price: number;
  canContinue: boolean;
  onContinue: () => void;
}) {
  const line = [
    courtNumber ? `Court ${courtNumber}` : null,
    shortDay(date),
    start ? `${time12(start.start)}–${time12(start.end)}` : durationLabel(duration),
  ]
    .filter(Boolean)
    .join(" · ");
  const showBar = step === "time";
  return (
    <>
      <aside aria-label="Booking summary" className="hidden lg:block">
        <div className="sticky top-24 rounded-2xl border border-white/10 bg-[#111827] p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
            Your booking
          </p>
          <dl className="mt-4 space-y-3 text-sm">
            <SumRow k="Court" v={courtNumber ? `Court ${courtNumber}` : "Not chosen"} />
            <SumRow k="Day" v={longDay(date)} />
            <SumRow
              k="Time"
              v={start ? `${time12(start.start)} – ${time12(start.end)}` : "Not chosen"}
            />
            <SumRow k="Length" v={durationLabel(duration)} />
          </dl>
          <div className="mt-4 flex items-baseline justify-between border-t border-white/10 pt-4">
            <span className="text-sm text-[#CBD5E1]">Total incl. GST</span>
            <span className="font-display text-3xl font-bold text-white">
              {start ? `₹${payable(price).toLocaleString("en-IN")}` : "—"}
            </span>
          </div>
          {showBar ? (
            <button
              type="button"
              disabled={!canContinue}
              onClick={onContinue}
              className={`${btnPrimary} mt-4 w-full`}
            >
              Continue
            </button>
          ) : null}
        </div>
      </aside>

      {showBar ? (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#0A0F1E]/95 px-4 py-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-6xl items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{line}</p>
              <p className="text-xs text-[#94A3B8]">
                {start
                  ? `₹${payable(price).toLocaleString("en-IN")} incl. GST`
                  : "Pick a start time"}
              </p>
            </div>
            <button
              type="button"
              disabled={!canContinue}
              onClick={onContinue}
              className={`${btnPrimary} h-11 shrink-0 px-5`}
            >
              Continue
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

function SumRow({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-[#94A3B8]">{k}</dt>
      <dd className="text-right font-medium text-white">{v}</dd>
    </div>
  );
}

function ErrorBox({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="mt-4 flex items-center justify-between gap-3 rounded-xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.08] px-4 py-3 text-sm text-[#FFD7DD]"
    >
      <span>{message}</span>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="shrink-0 font-medium text-white underline"
        >
          Retry
        </button>
      ) : null}
    </div>
  );
}

const shortDay = (d: string) =>
  new Date(`${d}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
const longDay = (d: string) =>
  new Date(`${d}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Asia/Kolkata",
  });
const clock = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
