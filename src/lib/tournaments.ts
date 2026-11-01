/**
 * Tournament listing helpers: where each event lives, which photo it uses,
 * and whether it is upcoming, open, live or finished.
 *
 * There is no past-events API: `/v1/public/events` returns published and
 * in-progress events only, so a finished event drops out of it once an admin
 * marks it completed. `PAST_EVENTS` keeps those reachable from the archive.
 * ponytail: hand-kept archive list; replace with `GET /v1/public/events?scope=past`
 * (status = completed, newest first) when the API grows it.
 */
import type { PublicEventSummary, PublicTournament } from "./api";
import { PHOTOS } from "./site";

/** Events whose page is bespoke — existing URLs, never renamed. */
const EVENT_PAGES: Record<string, string> = {
  "october-2026": "/october",
  season5: "/october",
  season6: "/october",
  "dupr-night": "/events/dupr-night",
};

export const eventHref = (slug: string): string => EVENT_PAGES[slug] ?? `/events/${slug}`;

/**
 * Banner per event. `banner_storage_key` is a MinIO key with no public URL
 * builder on this site yet, so real event photography stands in.
 */
export function eventImage(_slug: string): { src: string; alt: string } {
  return PHOTOS.match;
}

export type EventPhase = "upcoming" | "open" | "closed" | "live" | "completed";

export function eventPhase(
  t: Pick<PublicTournament, "start_date" | "end_date" | "reg_open_at" | "reg_close_at"> & {
    registration_closed?: boolean;
  },
  today: string,
  now = Date.now(),
): EventPhase {
  if (t.end_date < today) return "completed";
  if (t.start_date <= today) return "live";
  if (t.registration_closed) return "closed";
  if (now < Date.parse(t.reg_open_at)) return "upcoming";
  if (now <= Date.parse(t.reg_close_at)) return "open";
  return "closed";
}

export const PHASE_LABEL: Record<EventPhase, string> = {
  upcoming: "Registration opens soon",
  open: "Registration open",
  closed: "Registration closed",
  live: "Happening now",
  completed: "Completed",
};

export type ArchivedEvent = {
  slug: string;
  name: string;
  start_date: string;
  end_date: string;
  /** Existing page for the event, or null when it never had one. */
  href: string | null;
  note: string;
};

/** Finished events, newest first. Facts only — no results are published here. */
export const PAST_EVENTS: ArchivedEvent[] = [
  {
    slug: "october-2026",
    name: "Pickleball Central Open — Season 7",
    start_date: "2026-10-18",
    end_date: "2026-10-25",
    href: null,
    note: "Amateur (DUPR ≤ 3.6) and Intermediate (DUPR ≤ 4.2) · ₹30,000 prize pool each",
  },
  {
    slug: "dupr-night",
    name: "DUPR Night",
    start_date: "2026-10-11",
    end_date: "2026-10-11",
    href: null,
    note: "Singles & doubles · no DUPR cap · minimum 4 matches",
  },
  {
    // One-day event (packages/db/scripts/seed-season6.ts); /season6 now redirects.
    slug: "season6",
    name: "Pickleball Central Open — Season 6",
    start_date: "2026-09-26",
    end_date: "2026-09-26",
    href: null,
    note: "Singles, Men's Doubles & Mixed Doubles · one day",
  },
];

/** Split the live listing into what's still ahead and what has finished. */
export function splitEvents(events: PublicEventSummary[], today: string) {
  const upcoming = events.filter((e) => e.end_date >= today);
  const finished = events.filter((e) => e.end_date < today);
  const known = new Set(PAST_EVENTS.map((e) => e.slug));
  const past: ArchivedEvent[] = [
    ...finished
      .filter((e) => !known.has(e.slug))
      .map((e) => ({
        slug: e.slug,
        name: e.name,
        start_date: e.start_date,
        end_date: e.end_date,
        href: eventHref(e.slug),
        note: e.venue ?? "Pickleball Central",
      })),
    ...PAST_EVENTS,
  ].sort((a, b) => b.end_date.localeCompare(a.end_date));
  return { upcoming, past };
}

const DAY = new Intl.DateTimeFormat("en-IN", {
  weekday: "short",
  day: "numeric",
  month: "short",
  timeZone: "Asia/Kolkata",
});
const DAY_YEAR = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "Asia/Kolkata",
});

const asDate = (ymd: string) => new Date(`${ymd}T12:00:00+05:30`);

/** "Sun, 18 Oct" or "Sun, 18 Oct – Sun, 25 Oct". */
export function dateRange(start: string, end: string): string {
  return start === end
    ? DAY.format(asDate(start))
    : `${DAY.format(asDate(start))} – ${DAY.format(asDate(end))}`;
}

export const longDate = (ymd: string): string => DAY_YEAR.format(asDate(ymd));
