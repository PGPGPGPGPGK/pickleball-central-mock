"use client";

/**
 * /checkin?code=… — where the venue's CHECK-IN QR lands (QR type B; the
 * "book a court" QR opens /play instead). Works without the app: sign in with
 * the booking's phone, pick today's booking, check in. The server decides
 * everything — window, payment, duplicates — and starts no time early.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiHttpError } from "@/lib/api";
import { authFetch, type Me, restoreSession } from "@/lib/auth";
import { friendlyError } from "@/lib/friendly-error";

import { PhoneSignIn } from "../checkout/CustomerDetails";
import { btnPrimary, btnSecondary } from "../site/ui";
import { SessionView, type SessionJson } from "./SessionView";

const t12 = (iso: string | null) =>
  iso ? new Date(iso).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" }) : "";

export function CheckInFlow({ code }: { code: string | null }) {
  const [me, setMe] = useState<Me | null | undefined>(undefined);
  const [sessions, setSessions] = useState<SessionJson[] | null>(null);
  const [active, setActive] = useState<SessionJson | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void restoreSession().then(setMe);
  }, []);

  useEffect(() => {
    if (!me) return;
    authFetch<{ sessions: SessionJson[] }>("/v1/bookings/me/sessions")
      .then((r) => {
        setSessions(r.sessions);
        const live = r.sessions.find((x) => x.state === "active" || x.state === "checked_in_early");
        if (live) setActive(live);
      })
      .catch((err: unknown) => setError(friendlyError(err, "Couldn't load your bookings.")));
  }, [me]);

  const checkIn = async (s: SessionJson) => {
    if (!code) return;
    setBusy(s.booking_id);
    setError(null);
    try {
      setActive(
        await authFetch<SessionJson>(`/v1/bookings/${s.booking_id}/check-in`, {
          method: "POST",
          body: JSON.stringify({ code }),
        }),
      );
    } catch (err) {
      setError(
        err instanceof ApiHttpError && err.code === "too_early"
          ? `Check-in opens at ${t12(s.check_in_opens_at)} — 10 minutes before your booking.`
          : friendlyError(err, "Couldn't check you in. The front desk can help."),
      );
    } finally {
      setBusy(null);
    }
  };

  if (active) return <SessionView bookingId={active.booking_id} initial={active} />;

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0F1525] p-5 sm:p-7">
      <h1 className="font-display text-4xl font-extrabold uppercase text-white">Check in</h1>
      {!code ? (
        <p className="mt-2 text-[#CBD5E1]">Scan the check-in QR at the venue entrance to check in to your booking.</p>
      ) : me === undefined ? (
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" />
      ) : !me ? (
        <>
          <p className="mt-2 text-[#CBD5E1]">Sign in with the phone number you booked with.</p>
          <PhoneSignIn onSignedIn={setMe} />
        </>
      ) : sessions === null ? (
        <div className="mt-4 h-24 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" />
      ) : sessions.length === 0 ? (
        <>
          <p className="mt-2 text-[#CBD5E1]">You have no court booked for today.</p>
          <Link href="/play" className={`${btnPrimary} mt-4`}>
            Book a Court
          </Link>
        </>
      ) : (
        <ul className="mt-4 space-y-3">
          {sessions.map((s) => {
            const can = s.state === "check_in_open" || s.state === "upcoming" || s.state === "no_show";
            return (
              <li key={s.booking_id} className="rounded-2xl border border-white/10 p-4">
                <p className="font-display text-2xl font-bold uppercase text-white">Court {s.court_numbers.join(" + ")}</p>
                <p className="text-sm text-[#CBD5E1]">
                  {t12(s.scheduled_start)} – {t12(s.scheduled_end)} · Ref {s.booking_number}
                </p>
                {can ? (
                  <button type="button" disabled={busy !== null} onClick={() => void checkIn(s)} className={`${btnPrimary} mt-3 w-full`}>
                    {busy === s.booking_id ? "Checking in…" : "Check in"}
                  </button>
                ) : s.state === "ended" ? (
                  <p className="mt-2 text-sm text-[#94A3B8]">This session has ended.</p>
                ) : s.state === "unpaid" ? (
                  <p className="mt-2 text-sm text-[#FF9AA8]">Payment not verified — this booking can&rsquo;t be checked in.</p>
                ) : (
                  <button type="button" onClick={() => setActive(s)} className={`${btnSecondary} mt-3 w-full`}>
                    View session
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
      {error ? (
        <p role="alert" className="mt-4 rounded-xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.08] p-3 text-sm text-[#FFD7DD]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
