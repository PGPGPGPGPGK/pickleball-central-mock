import Image from "next/image";
import Link from "next/link";

import type { PublicEventSummary } from "@/lib/api";
import {
  type ArchivedEvent,
  dateRange,
  eventHref,
  eventImage,
  eventPhase,
  longDate,
  PHASE_LABEL,
} from "@/lib/tournaments";
import { Icon } from "@/components/site/Icon";

/** Compact upcoming-event card: fixed 16:9 photo, name, dates, entry fee, state. */
export function EventCard({ event, today }: { event: PublicEventSummary; today: string }) {
  const phase = eventPhase(event, today);
  const img = eventImage(event.slug);
  return (
    <Link
      href={eventHref(event.slug)}
      className="group block overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] transition-colors duration-200 hover:border-[#C8F400]/40"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-[#1C2535]">
        <Image
          src={img.src}
          alt={img.alt}
          fill
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          loading="lazy"
          unoptimized
        />
        <span
          className={`absolute left-3 top-3 rounded-full px-2.5 py-1 font-mono text-[11px] uppercase tracking-[0.12em] ${
            phase === "open" ? "bg-[#C8F400] text-[#0A0F1E]" : "bg-[#0A0F1E]/80 text-white"
          }`}
        >
          {PHASE_LABEL[phase]}
        </span>
      </div>
      <div className="p-4">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94A3B8]">
          {dateRange(event.start_date, event.end_date)}
        </p>
        <h3 className="mt-1.5 font-display text-2xl font-bold uppercase leading-tight text-white">
          {event.name}
        </h3>
        <p className="mt-2 text-sm text-[#CBD5E1]">
          Entry from ₹{event.from_fee.toLocaleString("en-IN")} ·{" "}
          {event.venue ?? "Pickleball Central"}
        </p>
      </div>
    </Link>
  );
}

/** Archive row: no photo, no CTA — just what it was and where its page lives. */
export function PastEventRow({ event }: { event: ArchivedEvent }) {
  const body = (
    <>
      <div className="min-w-0">
        <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-[#94A3B8]">
          {event.start_date === event.end_date
            ? longDate(event.start_date)
            : `${dateRange(event.start_date, event.end_date)} ${event.end_date.slice(0, 4)}`}
        </p>
        <h3 className="mt-1 truncate font-display text-xl font-bold uppercase text-white">
          {event.name}
        </h3>
        <p className="mt-1 text-sm text-[#94A3B8]">{event.note}</p>
      </div>
      {event.href ? (
        <span className="text-[#C8F400] transition-transform group-hover:translate-x-1">
          <Icon name="arrow-right" className="h-4 w-4" />
        </span>
      ) : null}
    </>
  );
  const cls =
    "group flex items-center justify-between gap-4 border-b border-white/[0.06] py-4 last:border-0";
  return event.href ? (
    <Link href={event.href} className={cls}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}
