// /account — My Bookings.
//
// The website has no player sign-in yet (player auth is phone OTP in the
// app), so production shows where bookings live today. The local preview
// renders the intended page on clearly labelled SAMPLE data.
//
// Status rules the real page must keep (from the payment lifecycle work):
//   Upcoming — confirmed bookings that haven't started.
//   History  — completed, cancelled (a person cancelled it: cancelled_by set)
//              and refunded. Holds and abandoned/expired payment attempts
//              (cancelled with cancelled_by NULL) are never listed at all.
// Rebook carries court + duration to /play, which re-checks both live.
//
// Backend needed: web OTP sign-in for the site + GET /v1/bookings/me filtered
// as above — see docs/website-redesign.md.

import type { Metadata } from "next";
import Link from "next/link";

import { btnPrimary, btnSecondary, PageIntro, SampleBadge } from "@/components/site/ui";
import { PREVIEW_MOCKS } from "@/lib/api";
import { durationLabel, fromMin, nextDays, time12, toMin } from "@/lib/booking";
import { istToday } from "@/lib/format";
import { CONTACT, STORES } from "@/lib/site";
import { Icon } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "My bookings",
  robots: { index: false, follow: false },
};

type Status = "confirmed" | "completed" | "cancelled" | "refunded";
type Booking = {
  ref: string;
  court: number;
  date: string;
  start: string;
  minutes: number;
  paid: number;
  status: Status;
  note?: string;
};

/** SAMPLE DATA — local preview only. Dates are relative to today. */
function sampleBookings(today: string): Booking[] {
  const [, d1, , d3] = nextDays(today, 4);
  const back = (n: number) =>
    new Date(Date.parse(`${today}T12:00:00Z`) - n * 86_400_000).toISOString().slice(0, 10);
  return [
    {
      ref: "SAMPLE-1042",
      court: 2,
      date: d1!,
      start: "19:00",
      minutes: 90,
      paid: 1062,
      status: "confirmed",
    },
    {
      ref: "SAMPLE-1047",
      court: 4,
      date: d3!,
      start: "07:00",
      minutes: 60,
      paid: 708,
      status: "confirmed",
    },
    {
      ref: "SAMPLE-0988",
      court: 1,
      date: back(3),
      start: "18:30",
      minutes: 120,
      paid: 1416,
      status: "completed",
    },
    {
      ref: "SAMPLE-0971",
      court: 3,
      date: back(8),
      start: "20:00",
      minutes: 60,
      paid: 708,
      status: "refunded",
      note: "Cancelled more than 24h ahead · ₹708 refunded",
    },
    {
      ref: "SAMPLE-0950",
      court: 2,
      date: back(12),
      start: "06:30",
      minutes: 60,
      paid: 708,
      status: "cancelled",
      note: "Cancelled within 12h · no refund under the policy",
    },
    {
      ref: "SAMPLE-0932",
      court: 1,
      date: back(15),
      start: "17:00",
      minutes: 90,
      paid: 1062,
      status: "completed",
    },
  ];
}

const STATUS: Record<Status, { label: string; cls: string }> = {
  confirmed: { label: "Confirmed", cls: "bg-[#C8F400] text-[#0A0F1E]" },
  completed: { label: "Completed", cls: "bg-white/10 text-[#E2E8F0]" },
  cancelled: { label: "Cancelled", cls: "bg-[#FF7A8C]/15 text-[#FFB3BE]" },
  refunded: { label: "Refunded", cls: "bg-sky-400/15 text-sky-200" },
};

type Props = { searchParams: Promise<{ tab?: string; empty?: string }> };

export default function AccountPage() {
  return <NoWebAccount />;
}

export async function AccountPageSample({ searchParams }: Props) {
  if (!PREVIEW_MOCKS) return <NoWebAccount />;

  const { tab, empty } = await searchParams;
  const today = istToday();
  const all = empty === "1" ? [] : sampleBookings(today);
  const upcoming = all
    .filter((b) => b.status === "confirmed" && b.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date));
  const history = all
    .filter((b) => b.status !== "confirmed")
    .sort((a, b) => b.date.localeCompare(a.date));
  const showHistory = tab === "history";
  const list = showHistory ? history : upcoming;

  return (
    <>
      <PageIntro title="My bookings">
        <SampleBadge>Sample data — local preview</SampleBadge>
      </PageIntro>
      <div className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <p className="mb-5 text-sm text-[#94A3B8]">
          Signed in as a sample player. On the live site this page needs web sign-in (not built
          yet).
        </p>
        <nav
          aria-label="Booking lists"
          className="flex gap-1 rounded-full border border-white/10 p-1"
        >
          {[
            {
              id: "upcoming",
              label: `Upcoming (${upcoming.length})`,
              href: `/account${empty ? "?empty=1" : ""}`,
            },
            {
              id: "history",
              label: `History (${history.length})`,
              href: `/account?tab=history${empty ? "&empty=1" : ""}`,
            },
          ].map((t) => {
            const on = (t.id === "history") === showHistory;
            return (
              <Link
                key={t.id}
                href={t.href}
                aria-current={on ? "page" : undefined}
                className={`flex-1 rounded-full py-2.5 text-center text-sm font-medium transition-colors ${on ? "bg-white text-[#0A0F1E]" : "text-[#CBD5E1] hover:text-white"}`}
              >
                {t.label}
              </Link>
            );
          })}
        </nav>

        {list.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 p-8 text-center">
            <p className="font-display text-2xl font-bold uppercase text-white">
              {showHistory ? "No past bookings yet" : "Nothing booked yet"}
            </p>
            <p className="mt-2 text-sm text-[#94A3B8]">
              {showHistory
                ? "Finished, cancelled and refunded bookings show up here."
                : "Your next game is a minute away."}
            </p>
            <Link href="/play" className={`${btnPrimary} mt-5`}>
              Book a Court
            </Link>
          </div>
        ) : (
          <ul className="mt-6 space-y-3">
            {list.map((b) => (
              <li key={b.ref} className="rounded-2xl border border-white/[0.08] bg-[#111827] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-2xl font-bold uppercase leading-none text-white">
                      Court {b.court}
                    </p>
                    <p className="mt-2 text-sm text-[#E2E8F0]">
                      {new Date(`${b.date}T12:00:00+05:30`).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                        timeZone: "Asia/Kolkata",
                      })}{" "}
                      · {time12(b.start)} – {time12(fromMin(toMin(b.start) + b.minutes))}
                    </p>
                    <p className="mt-1 text-xs text-[#94A3B8]">
                      {durationLabel(b.minutes)} · ₹{b.paid.toLocaleString("en-IN")} paid · {b.ref}
                    </p>
                    {b.note ? <p className="mt-1 text-xs text-[#CBD5E1]">{b.note}</p> : null}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${STATUS[b.status].cls}`}
                  >
                    {STATUS[b.status].label}
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 border-t border-white/[0.06] pt-3">
                  {b.status === "confirmed" ? (
                    <a
                      href={CONTACT.directions}
                      className="rounded-full border border-white/15 px-3.5 py-2 text-sm text-white hover:border-white/35"
                    >
                      Directions
                    </a>
                  ) : null}
                  <Link
                    href={`/play?rebookCourt=${b.court}&duration=${b.minutes}`}
                    className="rounded-full px-3.5 py-2 text-sm font-medium text-[#C8F400] hover:underline"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Rebook Court {b.court} · {durationLabel(b.minutes)}{" "}
                      <Icon name="arrow-right" className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-6 text-center text-xs text-[#94A3B8]">
          Preview the empty state:{" "}
          <Link
            href={empty ? "/account" : "/account?empty=1"}
            className="text-[#C8F400] hover:underline"
          >
            {empty ? "show sample bookings" : "show no bookings"}
          </Link>
        </p>
      </div>
    </>
  );
}

/** Production today: no web sign-in exists, so point to where bookings are. */
function NoWebAccount() {
  return (
    <>
      <PageIntro
        title="My bookings"
        lede="Your bookings live in the Pickleball Central app. Sign in there with the phone number you booked with."
      >
        <a href={STORES.android} className={btnPrimary}>
          Google Play
        </a>
        <a href={STORES.ios} className={btnSecondary}>
          App Store
        </a>
      </PageIntro>
      <div className="mx-auto max-w-7xl px-4 pb-20 text-sm text-[#CBD5E1] sm:px-6">
        Every booking is also confirmed by email with its GST invoice. Need a hand?{" "}
        <a href={CONTACT.whatsappChat} className="text-[#C8F400] hover:underline">
          Message us on WhatsApp
        </a>
        .
      </div>
    </>
  );
}
