import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import type { PublicTournament, PublicTournamentCategory } from "@/lib/api";
import { CONTACT } from "@/lib/site";
import { dateRange, eventImage, eventPhase, longDate, PHASE_LABEL } from "@/lib/tournaments";
import { Icon } from "@/components/site/Icon";

const SKILL: Record<string, string> = {
  amateur: "Amateur",
  intermediate: "Intermediate",
  advanced: "Advanced",
  open: "Open",
};
const GENDER: Record<string, string> = { men: "Men's", women: "Women's", mixed: "Mixed", open: "" };
const PLAY: Record<string, string> = { singles: "Singles", doubles: "Doubles" };

const categoryName = (c: PublicTournamentCategory) =>
  [SKILL[c.skill_level], GENDER[c.gender], PLAY[c.play_type]].filter(Boolean).join(" ");

/**
 * Data-driven tournament page. Everything shown comes from the public
 * tournament API; `register` is the existing registration component (its
 * validation, capacity and payment rules are untouched). The template only
 * decides when to show it: never for a finished, live or not-yet-open event.
 */
export function TournamentDetail({
  tournament: t,
  categories,
  today,
  now,
  register,
  closed,
}: {
  tournament: PublicTournament;
  categories: PublicTournamentCategory[];
  today: string;
  /** Clock override for the local template preview only. */
  now?: number;
  /** The registration form, shown only while registration is open. */
  register: ReactNode;
  /** Shown when an admin has closed registration. */
  closed: ReactNode;
}) {
  const phase = eventPhase(t, today, now);
  const img = eventImage(t.slug);
  const fees = categories.map((c) => c.current_price);
  const from = fees.length ? Math.min(...fees) : null;
  const days = [...new Set(categories.map((c) => c.schedule_date).filter(Boolean))] as string[];

  return (
    <article className="pb-20">
      {/* Banner: reserved 16:9 (21:9 on desktop), so nothing shifts as it loads. */}
      <div className="relative mx-auto max-w-7xl px-4 pt-4 sm:px-6 md:pt-8">
        <Link
          href="/tournaments"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-[#94A3B8] hover:text-white"
        >
          <Icon name="arrow-left" /> All tournaments
        </Link>
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-[#1C2535] md:aspect-[21/9]">
          <Image
            src={img.src}
            alt={img.alt}
            fill
            priority
            sizes="(min-width: 1280px) 1232px, 100vw"
            className="object-cover"
            unoptimized
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-[#0A0F1E]/40 to-transparent"
          />
          <div className="absolute inset-x-0 bottom-0 p-5 md:p-8">
            <h1 className="max-w-3xl font-display text-4xl font-extrabold uppercase leading-[0.92] text-white md:text-6xl">
              {t.name}
            </h1>
            <p
              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${
                phase === "open"
                  ? "bg-[#C8F400] text-[#0A0F1E]"
                  : "bg-white/15 text-white backdrop-blur"
              }`}
            >
              {PHASE_LABEL[phase]}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_26rem]">
        <div className="min-w-0">
          <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-4">
            <Fact label="When" value={dateRange(t.start_date, t.end_date)} />
            <Fact label="Where" value={t.venue ?? CONTACT.name} />
            <Fact
              label="Entry from"
              value={from !== null ? `₹${from.toLocaleString("en-IN")}` : "—"}
            />
            <Fact
              label={phase === "completed" ? "Categories" : "Registration closes"}
              value={
                phase === "completed"
                  ? String(categories.length)
                  : new Date(t.reg_close_at).toLocaleString("en-IN", {
                      day: "numeric",
                      month: "short",
                      hour: "numeric",
                      minute: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })
              }
            />
          </dl>

          {phase === "open" ? (
            <a
              href="#register"
              className="mt-4 flex h-12 items-center justify-center rounded-full bg-[#C8F400] font-semibold text-[#0A0F1E] lg:hidden"
            >
              <span className="inline-flex items-center gap-2">
                Register now <Icon name="arrow-down" />
              </span>
            </a>
          ) : null}

          <section aria-labelledby="cats" className="mt-10">
            <h2 id="cats" className="font-display text-2xl font-bold uppercase text-white">
              Categories
            </h2>
            {categories.length === 0 ? (
              <p className="mt-3 text-sm text-[#94A3B8]">Categories will be announced soon.</p>
            ) : (
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {categories.map((c) => {
                  const left = Math.max(0, c.max_registrations - c.confirmed_count);
                  const pct = Math.min(
                    100,
                    (c.confirmed_count / Math.max(1, c.max_registrations)) * 100,
                  );
                  return (
                    <li
                      key={c.id}
                      className="rounded-2xl border border-white/[0.08] bg-[#111827] p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-white">{categoryName(c)}</p>
                          <p className="mt-1 text-xs text-[#94A3B8]">
                            {c.schedule_date && days.length > 1
                              ? `${longDate(c.schedule_date)} · `
                              : ""}
                            {c.dupr_cap_max !== null ? `DUPR ≤ ${c.dupr_cap_max}` : "No DUPR cap"}
                          </p>
                        </div>
                        <p className="shrink-0 text-right">
                          <span className="font-display text-xl font-bold text-white">
                            ₹{c.current_price.toLocaleString("en-IN")}
                          </span>
                          <span className="block text-[11px] text-[#94A3B8]">
                            {c.play_type === "doubles" ? "per team" : "per player"}
                          </span>
                        </p>
                      </div>
                      {phase !== "completed" ? (
                        <div className="mt-4">
                          <div className="h-1 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-[#C8F400]"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <p className="mt-1.5 text-xs text-[#CBD5E1]">
                            {left > 0 ? `${left} of ${c.max_registrations} spots left` : "Full"}
                          </p>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {t.description ? (
            <section aria-labelledby="about" className="mt-10">
              <h2 id="about" className="font-display text-2xl font-bold uppercase text-white">
                About
              </h2>
              <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed text-[#CBD5E1]">
                {t.description}
              </p>
            </section>
          ) : null}

          {t.rules_md ? (
            <section aria-labelledby="rules" className="mt-10">
              <h2 id="rules" className="font-display text-2xl font-bold uppercase text-white">
                Rules
              </h2>
              <Markdownish source={t.rules_md} />
            </section>
          ) : null}
        </div>

        <aside
          id="register"
          className="scroll-mt-20 lg:sticky lg:top-24 lg:self-start"
          aria-label="Registration"
        >
          {phase === "open" ? (
            register
          ) : phase === "closed" ? (
            closed
          ) : (
            <StatusPanel phase={phase} regOpensAt={t.reg_open_at} />
          )}
        </aside>
      </div>
    </article>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-[#0F1525] p-4">
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 text-sm font-semibold text-white">{value}</dd>
    </div>
  );
}

function StatusPanel({
  phase,
  regOpensAt,
}: {
  phase: "upcoming" | "live" | "completed";
  regOpensAt: string;
}) {
  const copy = {
    upcoming: {
      title: "Registration opens soon",
      body: `Online registration opens ${new Date(regOpensAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", timeZone: "Asia/Kolkata" })}.`,
    },
    live: {
      title: "Happening now",
      body: "Registration has closed. Follow the schedule and updates in the WhatsApp community.",
    },
    completed: {
      title: "This event has finished",
      body: "Results aren't published on the website yet. Ask in the WhatsApp community, or see what's coming up next.",
    },
  }[phase];
  return (
    <div className="rounded-2xl border border-white/[0.08] bg-[#111827] p-6">
      <h2 className="font-display text-2xl font-bold uppercase text-white">{copy.title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">{copy.body}</p>
      <div className="mt-5 flex flex-col gap-2">
        <a
          href={CONTACT.whatsappCommunity}
          className="inline-flex h-11 items-center justify-center rounded-full border border-white/15 text-sm font-medium text-white hover:border-white/35"
        >
          WhatsApp community
        </a>
        <Link
          href="/tournaments"
          className="inline-flex h-11 items-center justify-center rounded-full text-sm font-medium text-[#C8F400] hover:underline"
        >
          <span className="inline-flex items-center gap-1.5">
            Upcoming tournaments <Icon name="arrow-right" className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}

/**
 * The rules field is admin-written markdown limited to `## heading`, `- item`
 * and `**bold**`. Rendered as React nodes — never as HTML.
 */
function Markdownish({ source }: { source: string }) {
  const lines = source
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const bold = (s: string) =>
    s.split(/\*\*(.+?)\*\*/g).map((part, i) =>
      i % 2 ? (
        <strong key={i} className="font-semibold text-white">
          {part}
        </strong>
      ) : (
        part
      ),
    );
  return (
    <ul className="mt-3 max-w-2xl space-y-2.5">
      {lines
        .filter((l) => !l.startsWith("#"))
        .map((l, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#CBD5E1]">
            <span
              aria-hidden="true"
              className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8F400]"
            />
            <span>{bold(l.replace(/^[-*]\s+/, ""))}</span>
          </li>
        ))}
    </ul>
  );
}
