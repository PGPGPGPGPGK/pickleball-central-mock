"use client";

/**
 * Court booking confirmation — read from the server, never from the URL.
 * Shows the booking only once it is confirmed (a hold or an unpaid attempt
 * renders "not confirmed"), with check-in instructions for the venue QR.
 */
import Link from "next/link";
import { useEffect, useState } from "react";

import { authFetch, restoreSession } from "@/lib/auth";
import { CONTACT, STORES } from "@/lib/site";

import { Icon } from "../site/Icon";
import { btnPrimary, btnSecondary } from "../site/ui";

type Session = {
  booking_number: string;
  booking_status: string;
  state: string;
  court_numbers: number[];
  scheduled_start: string | null;
  scheduled_end: string | null;
  check_in_opens_at: string | null;
};

type MeBooking = { id: string; total_amount: number };

const fmt = (iso: string, o: Intl.DateTimeFormatOptions) =>
  new Date(iso).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", ...o });

export function BookingConfirmation({ bookingId }: { bookingId: string }) {
  const [s, setS] = useState<Session | null>(null);
  const [amount, setAmount] = useState<number | null>(null);
  const [state, setState] = useState<"loading" | "ok" | "signed_out" | "missing">("loading");

  useEffect(() => {
    void (async () => {
      if (!(await restoreSession())) return setState("signed_out");
      try {
        setS(await authFetch<Session>(`/v1/bookings/${bookingId}/session`));
        const list = await authFetch<{ bookings?: MeBooking[] }>("/v1/bookings/me?scope=all").catch(() => ({ bookings: [] }));
        setAmount(list.bookings?.find((b) => b.id === bookingId)?.total_amount ?? null);
        setState("ok");
      } catch {
        setState("missing");
      }
    })();
  }, [bookingId]);

  if (state === "loading") return <div className="mt-8 h-64 animate-pulse rounded-2xl bg-white/[0.04] motion-reduce:animate-none" />;
  if (state !== "ok" || !s) {
    return (
      <div className="mt-8 rounded-2xl border border-white/10 p-6">
        <h1 className="font-display text-4xl font-extrabold uppercase text-white">Your booking</h1>
        <p className="mt-2 text-[#CBD5E1]">
          {state === "signed_out"
            ? "Sign in with the phone number you booked with to see this booking. Your confirmation email has the details too."
            : "We couldn't find this booking on your account."}
        </p>
        <Link href="/account" className={`${btnSecondary} mt-4`}>
          My bookings
        </Link>
      </div>
    );
  }

  const confirmed = ["confirmed", "checked_in", "completed"].includes(s.booking_status);
  if (!confirmed) {
    return (
      <div role="alert" className="mt-8 rounded-2xl border border-[#FF7A8C]/40 bg-[#FF7A8C]/[0.06] p-6">
        <h1 className="font-display text-4xl font-extrabold uppercase text-white">Not confirmed</h1>
        <p className="mt-2 text-[#FFD7DD]">
          This booking hasn&rsquo;t been confirmed — no court is reserved and nothing more will be charged. If money left
          your account, it is refunded automatically.
        </p>
        <Link href="/play" className={`${btnPrimary} mt-4`}>
          Book again
        </Link>
      </div>
    );
  }

  const start = s.scheduled_start!;
  const end = s.scheduled_end!;
  const mins = Math.round((Date.parse(end) - Date.parse(start)) / 60000);
  return (
    <div className="mt-6">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-[#C8F400] text-[#0A0F1E]">
        <Icon name="check" className="h-7 w-7" strokeWidth={2.6} />
      </div>
      <h1 className="mt-5 font-display text-5xl font-extrabold uppercase leading-[0.9] text-white md:text-6xl">
        Booking confirmed
      </h1>
      <p className="mt-3 text-[#CBD5E1]">See you on court. Your confirmation and GST invoice are on their way by email.</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-white/10 bg-[#111827]">
        <div className="border-b border-white/10 p-5">
          <p className="font-display text-3xl font-bold uppercase text-white">Court {s.court_numbers.join(" + ")}</p>
          <p className="mt-1 text-[#E2E8F0]">
            {fmt(start, { weekday: "long", day: "numeric", month: "long" })} ·{" "}
            {fmt(start, { hour: "numeric", minute: "2-digit" })} – {fmt(end, { hour: "numeric", minute: "2-digit" })} ({mins} min)
          </p>
          <p className="mt-1 text-sm text-[#94A3B8]">
            {amount !== null ? `Paid ₹${amount.toLocaleString("en-IN")} incl. GST · ` : ""}Payment verified · Ref {s.booking_number}
          </p>
        </div>
        <div className="p-5">
          <h2 className="font-semibold text-white">Checking in</h2>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-[#CBD5E1]">
            <li>Scan the check-in QR at the entrance from {s.check_in_opens_at ? fmt(s.check_in_opens_at, { hour: "numeric", minute: "2-digit" }) : "10 minutes before your start"}.</li>
            <li>Your timer starts at your booked start and ends at {fmt(end, { hour: "numeric", minute: "2-digit" })} — arriving late doesn&rsquo;t extend it.</li>
            <li>No phone? The front desk can check you in.</li>
          </ol>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a href={CONTACT.directions} className={btnPrimary}>
          Get directions
        </a>
        <Link href="/account" className={btnSecondary}>
          My bookings
        </Link>
      </div>
      <p className="mt-6 text-sm text-[#94A3B8]">
        Also in the app — sign in with the same phone number.{" "}
        <a href={STORES.android} className="text-[#C8F400] hover:underline">Google Play</a> ·{" "}
        <a href={STORES.ios} className="text-[#C8F400] hover:underline">App Store</a>
      </p>
    </div>
  );
}
