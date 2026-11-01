// /venue — what's here, how to get in, and how to reach us. Facts only, taken
// from the previous Amenities, LocationHours and Coaching sections; the court
// order is the confirmed layout shared with the booking map.

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { MAP_EMBED_SRC } from "@/components/landing/LocationHours";
import { TESTIMONIALS } from "@/components/landing/testimonials-data";
import { btnPrimary, btnSecondary, PageIntro, SectionHead } from "@/components/site/ui";
import { CONTACT, HOURS, LETTERBOX_CROP, type Photo as PhotoT, PHOTOS } from "@/lib/site";
import { Icon } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "The Venue — Peerzadiguda, Hyderabad",
  description:
    "Four pro pickleball courts with an on-site café and nail studio in Peerzadiguda, Hyderabad. Open 6 AM – 11 PM every day. Directions, entrance and contact.",
  alternates: { canonical: "/venue" },
};

const FACILITIES = [
  {
    name: "4 pro courts",
    detail:
      "Cushioned acrylic courts under lights, open 6 AM – 11 PM every day. Paddles are free, always.",
    hours: "6 AM – 11 PM",
  },
  {
    name: "Mini Alley Pally Cafe",
    detail:
      "Cold-pressed juices, protein bowls, post-match smoothies, and espresso. Right off the courts so you can refuel without losing your spot.",
    hours: "6 – 10 AM · 4 – 10 PM",
  },
  {
    name: "Nail Art Studio",
    detail: "Manicures, nail art, and express gel treatments next to the courts.",
    hours: "10 AM – 8 PM",
  },
] as const;

/** The venue's Google listing (same place id as the directions link). */
const GOOGLE_REVIEWS = "https://www.google.com/maps/place/?q=place_id:ChIJW8rKJbCfyzsRu4zLBYpLEoc";

/** From the entrance, walking up the walkway (courts on your right). */
const WALKWAY = ["Entrance", "Patio Seating", "Mini AlleyPally", "Indoor Seating", "Nail Studio"];

export default function VenuePage() {
  return (
    <>
      <PageIntro
        title={
          <>
            Come play <span className="text-[#C8F400]">with us</span>
          </>
        }
        lede={`Four pro courts, an on-site café and a nail studio, easy to reach from ${CONTACT.areas}.`}
      >
        <a href={CONTACT.directions} className={btnPrimary}>
          Get directions
        </a>
        <Link href="/play" className={btnSecondary}>
          Book a Court
        </Link>
      </PageIntro>

      {/* Gallery: fixed ratios, lazy below the first image. */}
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-2.5 px-4 sm:px-6 md:grid-cols-4 md:grid-rows-2">
        <Photo
          p={PHOTOS.facility}
          className="col-span-2 aspect-[16/10] md:row-span-2 md:aspect-auto"
          priority
        />
        <Photo p={PHOTOS.match} className="aspect-[4/3]" />
        <Photo p={PHOTOS.player} className="aspect-[4/3]" />
        <Photo p={PHOTOS.cafe} className="aspect-[4/3]" />
        <Photo p={PHOTOS.nails} className="aspect-[4/3]" />
      </div>

      <section
        aria-labelledby="facilities"
        className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 md:mt-24"
      >
        <h2
          id="facilities"
          className="font-display text-4xl font-extrabold uppercase text-white md:text-5xl"
        >
          Facilities
        </h2>
        <ul className="mt-6 divide-y divide-white/[0.08] border-y border-white/[0.08]">
          {FACILITIES.map((f) => (
            <li
              key={f.name}
              className="grid gap-1.5 py-5 md:grid-cols-[18rem_1fr_auto] md:items-baseline md:gap-8"
            >
              <h3 className="font-display text-2xl font-bold uppercase text-white">{f.name}</h3>
              <p className="max-w-[60ch] text-sm leading-relaxed text-[#CBD5E1]">{f.detail}</p>
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[#C8F400] md:text-right">
                {f.hours}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="reviews" className="mx-auto mt-16 max-w-7xl px-4 sm:px-6 md:mt-24">
        <SectionHead
          title={<span id="reviews">4.9★ on Google</span>}
          action={{ href: GOOGLE_REVIEWS, label: `${TESTIMONIALS.length}+ reviews` }}
        />
        <ul className="grid gap-3 md:grid-cols-3">
          {TESTIMONIALS.slice(0, 3).map((t) => (
            <li key={t.id} className="rounded-2xl border border-white/[0.08] bg-[#111827] p-5">
              <blockquote className="text-[15px] leading-relaxed text-[#E2E8F0]">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <p className="mt-4 text-sm font-semibold text-white">{t.name}</p>
              <p className="text-xs text-[#94A3B8]">{t.handle}</p>
            </li>
          ))}
        </ul>
      </section>

      <section
        aria-labelledby="find"
        className="mx-auto mt-16 grid max-w-7xl gap-8 px-4 sm:px-6 md:mt-24 lg:grid-cols-2"
      >
        <div>
          <h2
            id="find"
            className="font-display text-4xl font-extrabold uppercase text-white md:text-5xl"
          >
            From the entrance
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#CBD5E1]">
            Walk in from the entrance and follow the walkway; the courts are on your right. Courts 4
            and 3 are nearest the entrance; Courts 1 and 2 are at the far end, by the Nail Studio.
          </p>

          {/* Plan view, same orientation as the booking map. */}
          <div
            className="mt-6 grid max-w-sm grid-cols-[7.5rem_1fr] gap-2.5"
            role="img"
            aria-label="Venue plan: walkway on the left from the entrance at the bottom up to the Nail Studio; Courts 1 and 2 at the top, Courts 4 and 3 nearest the entrance."
          >
            <ol className="flex flex-col-reverse justify-between gap-1.5">
              {WALKWAY.map((s, i) => (
                <li
                  key={s}
                  className={`rounded-lg px-2.5 py-2 text-center text-[11px] font-semibold ${
                    i === 0 ? "bg-[#0E5A3D] text-white" : "border border-white/10 text-[#CBD5E1]"
                  }`}
                >
                  {i === 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <Icon name="arrow-up" className="h-3 w-3" strokeWidth={2.6} />
                      Entrance
                    </span>
                  ) : (
                    s
                  )}
                </li>
              ))}
            </ol>
            <div className="grid grid-cols-2 grid-rows-2 gap-2.5">
              {[1, 2, 4, 3].map((n) => (
                <div
                  key={n}
                  className="grid aspect-[3/4] place-items-center rounded-xl border border-[#E4ECE8]/40 bg-[#155953] font-display text-lg font-bold text-white"
                >
                  Court {n}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#111827]">
            <iframe
              src={MAP_EMBED_SRC}
              title="Map — Pickleball Central, Peerzadiguda"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
          <dl className="mt-4 grid gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08] sm:grid-cols-2">
            <Info label="Address">
              <address className="not-italic">
                {CONTACT.name}
                <br />
                {CONTACT.locality} {CONTACT.postcode}
              </address>
            </Info>
            <Info label="Hours">{HOURS}</Info>
            <Info label="Call">
              <a href={CONTACT.phoneHref} className="hover:text-[#C8F400]">
                {CONTACT.phone}
              </a>
            </Info>
            <Info label="Email / WhatsApp">
              <a href={`mailto:${CONTACT.email}`} className="break-all hover:text-[#C8F400]">
                {CONTACT.email}
              </a>
              <br />
              <a href={CONTACT.whatsappChat} className="text-[#C8F400] hover:underline">
                Message on WhatsApp
              </a>
            </Info>
          </dl>
        </div>
      </section>
      <div className="h-20" />
    </>
  );
}

function Photo({
  p,
  className,
  priority = false,
}: {
  p: PhotoT;
  className: string;
  priority?: boolean;
}) {
  return (
    <div className={`relative overflow-hidden rounded-2xl bg-[#1C2535] ${className}`}>
      <Image
        src={p.src}
        alt={p.alt}
        fill
        {...(priority ? { priority: true } : { loading: "lazy" as const })}
        sizes={priority ? "(min-width: 768px) 50vw, 100vw" : "(min-width: 768px) 25vw, 50vw"}
        className={`object-cover ${p.letterbox ? LETTERBOX_CROP : ""}`}
        unoptimized
      />
    </div>
  );
}

function Info({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="bg-[#0F1525] p-4 text-sm text-white">
      <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">{label}</dt>
      <dd className="mt-1 leading-relaxed">{children}</dd>
    </div>
  );
}
