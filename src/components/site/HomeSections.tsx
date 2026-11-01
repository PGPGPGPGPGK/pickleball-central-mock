import Image from "next/image";
import Link from "next/link";

import { EventCard } from "@/components/tournaments/EventCard";
import type { PublicEventSummary } from "@/lib/api";
import { MONTHLY_RATE_LABEL } from "@/lib/membership-plans";
import { CONTACT, LETTERBOX_CROP, type Photo as PhotoT, PHOTOS } from "@/lib/site";

import { Reveal } from "./Reveal";
import { btnSecondary, SectionHead } from "./ui";
import { Icon } from "./Icon";

const ACTIVITIES = [
  { href: "/play", title: "Book a Court", fact: "Live availability · pay online", primary: true },
  { href: "/tournaments", title: "Tournaments", fact: "DUPR-rated, roughly monthly" },
  { href: "/coaching", title: "Coaching", fact: "Batches for every level" },
  { href: "/membership", title: "Membership", fact: `From ${MONTHLY_RATE_LABEL} a month` },
  { href: "/download", title: "The App", fact: "Android & iPhone" },
  { href: "/venue", title: "The Venue", fact: "Café + nail studio on site" },
] as const;

export function HomeSections({ next, today }: { next: PublicEventSummary | null; today: string }) {
  return (
    <>
      {/* Intro + activity menu: every page one tap away, booking first. */}
      <section aria-labelledby="explore" className="mx-auto max-w-7xl px-4 pt-14 sm:px-6 md:pt-20">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr] lg:items-end">
          <div>
            <h2
              id="explore"
              className="font-display text-4xl font-extrabold uppercase leading-[0.92] text-white md:text-5xl"
            >
              Play, train, compete
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#CBD5E1]">
              Hyderabad&rsquo;s premier pickleball facility: four pro courts in Peerzadiguda, easy
              to reach from {CONTACT.areas}.
            </p>
          </div>
          <ul className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
            {ACTIVITIES.map((a, i) => (
              <li key={a.href}>
                <Reveal delay={i * 0.04}>
                  <Link
                    href={a.href}
                    className={`group flex min-h-[104px] flex-col justify-between rounded-2xl border p-4 transition-colors duration-200 ${
                      "primary" in a
                        ? "border-[#C8F400] bg-[#C8F400] text-[#0A0F1E] hover:bg-[#D8FF20]"
                        : "border-white/[0.08] bg-[#111827] text-white hover:border-white/25"
                    }`}
                  >
                    <span className="flex items-start justify-between gap-2">
                      <span className="font-display text-xl font-bold uppercase leading-none md:text-2xl">
                        {a.title}
                      </span>
                      <span className="transition-transform duration-200 group-hover:translate-x-0.5">
                        <Icon name="arrow-right" className="h-4 w-4" />
                      </span>
                    </span>
                    <span
                      className={`mt-3 text-[13px] leading-snug ${"primary" in a ? "text-[#0A0F1E]/75" : "text-[#94A3B8]"}`}
                    >
                      {a.fact}
                    </span>
                  </Link>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Next tournament — live; an honest empty state when nothing is open. */}
      <section
        aria-labelledby="next-event"
        className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 md:mt-24"
      >
        <SectionHead
          title={<span id="next-event">Next tournament</span>}
          action={{ href: "/tournaments", label: "All events" }}
        />
        {next ? (
          <div className="max-w-xl">
            <EventCard event={next} today={today} />
          </div>
        ) : (
          <div>
            <div className="grid overflow-hidden rounded-2xl border border-white/[0.08] bg-[#111827] md:grid-cols-[1fr_1.1fr]">
              <div className="relative aspect-[16/9] bg-[#1C2535] md:aspect-auto md:min-h-[240px]">
                <Image
                  src={PHOTOS.match.src}
                  alt={PHOTOS.match.alt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 768px) 45vw, 100vw"
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="flex flex-col justify-center p-6 md:p-8">
                <h3 className="font-display text-2xl font-bold uppercase text-white md:text-3xl">
                  The next tournament is on its way
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[#CBD5E1]">
                  We run DUPR-rated tournaments roughly once a month, and registrations open about
                  two weeks ahead. The WhatsApp community hears first.
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <a href={CONTACT.whatsappCommunity} className={btnSecondary}>
                    Join 150+ players on WhatsApp
                  </a>
                  <Link
                    href="/tournaments#past"
                    className="inline-flex h-12 items-center px-2 text-sm font-medium text-[#C8F400] hover:underline"
                  >
                    <span className="inline-flex items-center gap-1.5">
                      Past events <Icon name="arrow-right" className="h-4 w-4" />
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Venue intro. Photos keep fixed ratios so the grid never jumps. */}
      <section
        aria-labelledby="venue"
        className="mx-auto mt-16 max-w-7xl px-4 pb-6 sm:px-6 md:mt-24"
      >
        <div className="grid gap-8 lg:grid-cols-[1fr_1.3fr] lg:items-center">
          <div>
            <h2
              id="venue"
              className="font-display text-4xl font-extrabold uppercase leading-[0.92] text-white md:text-5xl"
            >
              More than a court
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-[#CBD5E1]">
              Grab a bite, get your nails done, or hang out between games. Everything you need is
              on-site.
            </p>
            <ul className="mt-5 space-y-2 text-sm text-[#E2E8F0]">
              <li>4 pro courts · open 6am–11pm, every day</li>
              <li>Mini Alley Pally Cafe</li>
              <li>Nail Art Studio</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="/venue" className={btnSecondary}>
                Explore the venue
              </Link>
              <a
                href={CONTACT.directions}
                className="inline-flex h-12 items-center px-2 text-sm font-medium text-[#C8F400] hover:underline"
              >
                <span className="inline-flex items-center gap-1.5">
                  Directions <Icon name="arrow-right" className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2.5">
            <Photo
              p={PHOTOS.facility}
              className="col-span-2 aspect-[16/9]"
              sizes="(min-width: 1024px) 55vw, 100vw"
            />
            <Photo
              p={PHOTOS.cafe}
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 27vw, 50vw"
            />
            <Photo
              p={PHOTOS.nails}
              className="aspect-[4/3]"
              sizes="(min-width: 1024px) 27vw, 50vw"
            />
          </div>
        </div>
      </section>
    </>
  );
}

function Photo({ p, className, sizes }: { p: PhotoT; className: string; sizes: string }) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#1C2535] ${className}`}>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        loading="lazy"
        sizes={sizes}
        className={`object-cover ${p.letterbox ? LETTERBOX_CROP : ""}`}
        unoptimized
      />
    </div>
  );
}
