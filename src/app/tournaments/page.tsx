// /tournaments — upcoming events from the public events API, then the archive.
//
// Upcoming = anything the API still lists whose last day is today or later;
// an event that has finished moves to Past Events automatically, even before
// an admin marks it completed. JSON-LD is built from the same live list, so a
// finished event is never advertised as scheduled.

import type { Metadata } from "next";
import Image from "next/image";

import { btnSecondary, PageIntro, SectionHead } from "@/components/site/ui";
import { EventCard, PastEventRow } from "@/components/tournaments/EventCard";
import { fetchPublicEvents } from "@/lib/api";
import { istToday } from "@/lib/format";
import { CONTACT } from "@/lib/site";
import { eventHref, splitEvents } from "@/lib/tournaments";

export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickleball-central.co.in";

export const metadata: Metadata = {
  title: "Pickleball Tournaments in Hyderabad",
  description:
    "Pickleball tournaments in Peerzadiguda, Hyderabad — monthly, DUPR-rated men's, women's & mixed doubles with cash prizes, trophies, and medals.",
  alternates: { canonical: "/tournaments" },
  openGraph: {
    title: "Pickleball Tournaments in Hyderabad",
    description:
      "DUPR-rated pickleball tournaments at Pickleball Central, Hyderabad — doubles formats, cash prizes, and live leaderboards.",
    url: "/tournaments",
    type: "website",
  },
};

// DUPR club page, as linked by the previous DUPR Verified section.
const DUPR_CLUB_URL = "https://dashboard.dupr.com/dashboard/browse/clubs/7947095927";

const FORMATS = [
  { title: "Men's & Women's Doubles", note: "Singles-skill pairs across amateur to open levels." },
  { title: "Mixed Doubles", note: "Balanced teams, bracketed by combined skill." },
  {
    title: "DUPR-rated",
    note: "Every match counts toward your Dynamic Universal Pickleball Rating.",
  },
];

const HOW_IT_WORKS = [
  "We run internal tournaments roughly once a month, open to everyone playing at Pickleball Central.",
  "Registrations open about two weeks ahead, online. Prices are flat and GST-inclusive, and every player needs a valid DUPR ID — every match is DUPR-rated.",
  "Brackets, scores, and leaderboards are live, and results feed your DUPR rating.",
];

export default async function TournamentsPage() {
  const today = istToday();
  const { upcoming, past } = splitEvents(await fetchPublicEvents(), today);

  const schema = upcoming.map((e) => ({
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: e.name,
    sport: "Pickleball",
    startDate: e.start_date,
    endDate: e.end_date,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: `${SITE_URL}${eventHref(e.slug)}`,
    location: {
      "@type": "Place",
      name: CONTACT.name,
      address: {
        "@type": "PostalAddress",
        streetAddress: "Peerzadiguda",
        addressLocality: "Hyderabad",
        addressRegion: "Telangana",
        postalCode: CONTACT.postcode,
        addressCountry: "IN",
      },
    },
    organizer: {
      "@type": "SportsActivityLocation",
      "@id": `${SITE_URL}/#facility`,
      name: CONTACT.name,
      url: SITE_URL,
    },
  }));

  return (
    <>
      {schema.length ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ) : null}

      <PageIntro
        title="Pickleball tournaments in Hyderabad"
        lede="DUPR-rated tournaments month after month: competitive doubles with real prize pools, trophies and live leaderboards."
      />

      <section aria-labelledby="upcoming" className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead title={<span id="upcoming">Upcoming</span>} />
        {upcoming.length ? (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {upcoming.map((e) => (
              <li key={e.slug}>
                <EventCard event={e} today={today} />
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-2xl border border-dashed border-white/15 bg-[#111827]/60 p-6 md:p-8">
            <h3 className="font-display text-2xl font-bold uppercase text-white">
              No tournament is open right now
            </h3>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-[#CBD5E1]">
              Registrations open about two weeks ahead. The WhatsApp community hears about the next
              one first.
            </p>
            <a href={CONTACT.whatsappCommunity} className={`${btnSecondary} mt-5`}>
              Join 150+ players on WhatsApp
            </a>
          </div>
        )}
      </section>

      <section aria-labelledby="formats" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 md:mt-24">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <h2
              id="formats"
              className="font-display text-3xl font-extrabold uppercase text-white md:text-5xl"
            >
              Formats &amp; registration
            </h2>
            <ol className="mt-6 space-y-4">
              {HOW_IT_WORKS.map((step, i) => (
                <li key={step} className="flex gap-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[#C8F400] font-display text-sm font-bold text-[#0A0F1E]">
                    {i + 1}
                  </span>
                  <span className="text-sm leading-relaxed text-[#CBD5E1] md:text-base">
                    {step}
                  </span>
                </li>
              ))}
            </ol>
          </div>
          <ul className="self-start divide-y divide-white/[0.08] border-y border-white/[0.08]">
            {FORMATS.map((f) => (
              <li key={f.title} className="py-4">
                <h3 className="font-semibold text-white">{f.title}</h3>
                <p className="mt-1 text-sm text-[#94A3B8]">{f.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="dupr" className="mx-auto mt-12 max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-5 rounded-2xl border border-white/[0.08] bg-[#111827] p-5 sm:flex-row sm:items-center">
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/dupr-logo.png`}
            alt="DUPR — Dynamic Universal Pickleball Rating"
            width={128}
            height={128}
            loading="lazy"
            className="h-16 w-16 rounded-xl"
          />
          <div className="flex-1">
            <h2 id="dupr" className="font-display text-2xl font-bold uppercase text-white">
              DUPR Verified Club
            </h2>
            <p className="mt-1 max-w-[60ch] text-sm leading-relaxed text-[#CBD5E1]">
              Pickleball Central is an officially verified DUPR club. Every tournament we run counts
              toward your Dynamic Universal Pickleball Rating.
            </p>
          </div>
          <a href={DUPR_CLUB_URL} className={btnSecondary}>
            Join the Club
          </a>
        </div>
      </section>

      <section
        id="past"
        aria-labelledby="past-title"
        className="mx-auto mt-16 max-w-7xl px-4 pb-20 sm:px-6 md:mt-24"
      >
        <SectionHead title={<span id="past-title">Past events</span>} />
        <div className="rounded-2xl border border-white/[0.08] bg-[#111827] px-5">
          {past.map((e) => (
            <PastEventRow key={e.slug} event={e} />
          ))}
        </div>
        <p className="mt-4 text-sm text-[#94A3B8]">
          Looking for results? They aren&rsquo;t on the website yet, so{" "}
          <a href={CONTACT.whatsappCommunity} className="text-[#C8F400] hover:underline">
            ask in the community
          </a>
          .
        </p>
      </section>
    </>
  );
}
