"use client";

/**
 * Active court session — big, outdoor-readable countdown driven by the
 * SERVER's deadline. The client never owns the time: each sync stores the
 * server's `server_now` against `performance.now()` (monotonic, immune to the
 * device clock), and the display counts down from that pair. Re-syncs every
 * 30 s and on focus / visibility / reconnect, so a refresh, a locked phone or
 * a changed device clock can't move the end time.
 */
import { useCallback, useEffect, useRef, useState } from "react";

import { authFetch } from "@/lib/auth";
import { CONTACT } from "@/lib/site";
import { friendlyError } from "@/lib/friendly-error";

import { Icon } from "../site/Icon";

export type SessionJson = {
  booking_id: string;
  booking_number: string;
  state:
    | "unpaid"
    | "cancelled"
    | "upcoming"
    | "check_in_open"
    | "checked_in_early"
    | "active"
    | "ended"
    | "no_show";
  court_numbers: number[];
  scheduled_start: string | null;
  scheduled_end: string | null;
  check_in_opens_at: string | null;
  checked_in_at: string | null;
  timer_starts_at: string | null;
  remaining_seconds: number;
  total_seconds: number;
  server_now: string;
};

const SYNC_MS = 30_000;
const t12 = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "—";

export function useServerSession(bookingId: string, initial?: SessionJson | null) {
  const [s, setS] = useState<SessionJson | null>(initial ?? null);
  const [error, setError] = useState<string | null>(null);
  const anchor = useRef<{ server: number; perf: number } | null>(
    initial ? { server: Date.parse(initial.server_now), perf: performance.now() } : null,
  );

  const sync = useCallback(async () => {
    try {
      const sent = performance.now();
      const next = await authFetch<SessionJson>(`/v1/bookings/${bookingId}/session`);
      // Half the round trip ≈ how stale server_now is on arrival.
      const perf = performance.now();
      anchor.current = { server: Date.parse(next.server_now) + (perf - sent) / 2, perf };
      setS(next);
      setError(null);
    } catch (err) {
      setError(friendlyError(err, "Reconnecting…"));
    }
  }, [bookingId]);

  useEffect(() => {
    if (!initial) void sync();
    const id = setInterval(() => void sync(), SYNC_MS);
    const wake = () => document.visibilityState === "visible" && void sync();
    document.addEventListener("visibilitychange", wake);
    window.addEventListener("online", wake);
    window.addEventListener("focus", wake);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", wake);
      window.removeEventListener("online", wake);
      window.removeEventListener("focus", wake);
    };
  }, [sync, initial]);

  /** The server's "now", advanced locally on the monotonic clock. */
  const serverNow = () => (anchor.current ? anchor.current.server + (performance.now() - anchor.current.perf) : Date.now());
  return { s, error, sync, serverNow };
}

export function SessionView({ bookingId, initial }: { bookingId: string; initial?: SessionJson | null }) {
  const { s, error, sync, serverNow } = useServerSession(bookingId, initial);
  const [, tick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, []);

  return <SessionBody s={s} error={error} sync={sync} serverNow={serverNow} />;
}

function SessionBody({
  s,
  error,
  sync,
  serverNow,
}: {
  s: SessionJson | null;
  error: string | null;
  sync: () => Promise<void>;
  serverNow: () => number;
}) {
  const now = serverNow();
  const startMs = s?.scheduled_start ? Date.parse(s.scheduled_start) : now;
  const endMs = s?.scheduled_end ? Date.parse(s.scheduled_end) : now;
  const crossed =
    !!s && ((s.state === "active" && now >= endMs) || (s.state === "checked_in_early" && now >= startMs));
  // Crossing a boundary locally → let the server confirm the new state.
  useEffect(() => {
    if (crossed) void sync();
  }, [crossed, sync]);

  if (!s) return <div className="h-80 animate-pulse rounded-3xl bg-white/[0.04] motion-reduce:animate-none" aria-label="Loading session" />;

  const end = s.scheduled_end ? Date.parse(s.scheduled_end) : now;
  const start = s.scheduled_start ? Date.parse(s.scheduled_start) : now;
  const running = s.state === "active" || (s.state === "checked_in_early" && now >= start);
  const waiting = s.state === "checked_in_early" && now < start;
  const remaining = running ? Math.max(0, Math.ceil((end - now) / 1000)) : 0;
  const untilStart = waiting ? Math.max(0, Math.ceil((start - now) / 1000)) : 0;

  const total = Math.max(1, s.total_seconds);
  const fraction = running ? remaining / total : waiting ? 1 : 0;
  const label =
    s.state === "ended" || (running && remaining === 0)
      ? "Session ended"
      : running
        ? "Playing — time left"
        : waiting
          ? "Checked in — starts in"
          : s.state === "unpaid"
            ? "Payment not verified"
            : s.state === "no_show"
              ? "Not checked in"
              : "Not checked in yet";

  return (
    <section aria-labelledby="sess" className="rounded-3xl border border-white/10 bg-[#0F1525] p-5 sm:p-7">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p id="sess" className="font-display text-4xl font-extrabold uppercase leading-none text-white">
            Court {s.court_numbers.join(" + ")}
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">Ref {s.booking_number}</p>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-sm font-semibold ${running && remaining > 0 ? "bg-[#C8F400] text-[#0A0F1E]" : "bg-white/10 text-white"}`}
        >
          {running && remaining > 0 ? "Active" : waiting ? "Checked in" : s.state === "ended" ? "Ended" : "Booked"}
        </span>
      </div>

      <p className="mt-6 text-sm font-medium uppercase tracking-[0.08em] text-[#CBD5E1]">{label}</p>
      <p
        className="mt-1 font-display text-[88px] font-black leading-none tabular-nums text-white sm:text-[120px]"
        role="timer"
        aria-live="off"
        aria-label={running ? `${Math.floor(remaining / 60)} minutes ${remaining % 60} seconds left` : waiting ? `starts in ${Math.ceil(untilStart / 60)} minutes` : label}
      >
        {running ? clock(remaining) : waiting ? clock(untilStart) : "--:--"}
      </p>

      <div
        className="mt-4 h-3 overflow-hidden rounded-full bg-white/10"
        role="progressbar"
        aria-label="Time left in your booking"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fraction * 100)}
      >
        <div className="h-full rounded-full bg-[#C8F400] transition-[width] duration-1000 ease-linear motion-reduce:transition-none" style={{ width: `${fraction * 100}%` }} />
      </div>

      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-[#94A3B8]">Booked</dt>
          <dd className="font-semibold text-white">
            {t12(s.scheduled_start)} – {t12(s.scheduled_end)}
          </dd>
        </div>
        <div>
          <dt className="text-[#94A3B8]">Ends at</dt>
          <dd className="font-semibold text-white">{t12(s.scheduled_end)}</dd>
        </div>
        {s.checked_in_at ? (
          <div>
            <dt className="text-[#94A3B8]">Checked in</dt>
            <dd className="font-semibold text-white">{t12(s.checked_in_at)}</dd>
          </div>
        ) : null}
      </dl>

      <p className="mt-5 text-sm text-[#CBD5E1]">
        Your time ends at the booked end, even if you started late. The next group may be waiting, so please clear the court on time.
      </p>
      {error ? <p className="mt-2 text-xs text-amber-200">{error}</p> : null}
      <a href={CONTACT.phoneHref} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-[#C8F400] hover:underline">
        Need help? Call the desk <Icon name="arrow-right" />
      </a>
    </section>
  );
}

const clock = (sec: number) => {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return h ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}` : `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};
