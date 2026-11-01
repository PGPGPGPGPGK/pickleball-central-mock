// /coaching — the coaching programs, previously a homepage section (the
// retired /coaches URL redirects here). No prices and no coach profiles: plans
// and prices are admin-configured and sold in the app, so they can't drift here.

import type { Metadata } from "next";
import Image from "next/image";

import { CoachingPlans } from "@/components/coaching/CoachingPlans";
import { PROGRAMS, PROOF, WA_LINK } from "@/components/landing/Coaching";
import { fetchPublicCoaching } from "@/lib/api";
import { btnPrimary, btnSecondary, PageIntro } from "@/components/site/ui";
import { PHOTOS } from "@/lib/site";
import { Icon } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "Pickleball Coaching in Hyderabad",
  description:
    "Pickleball coaching at Pickleball Central, Peerzadiguda — monthly programs for beginners, intermediate and advanced players, private sessions and a juniors track.",
  alternates: { canonical: "/coaching" },
};

export const revalidate = 60;

export default async function CoachingPage() {
  const plans = await fetchPublicCoaching();
  return (
    <>
      <PageIntro
        title={
          <>
            Get coached. <span className="text-[#C8F400]">Get better.</span>
          </>
        }
        lede="Coaching runs on monthly programs: structured batches for every level, plus private sessions when you want the court to yourself. Certified coaches, small groups, real match play."
      >
        <a href="#plans" className={btnPrimary}>
          See plans &amp; prices <Icon name="arrow-right" className="h-4 w-4" />
        </a>
        <a href={WA_LINK} className={btnSecondary}>
          Ask on WhatsApp
        </a>
      </PageIntro>

      <div className="mx-auto grid max-w-7xl gap-8 px-4 pb-20 sm:px-6 lg:grid-cols-[1fr_1.25fr]">
        <div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-[#1C2535]">
            <Image
              src={PHOTOS.coach.src}
              alt={PHOTOS.coach.alt}
              fill
              priority
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover object-top"
              unoptimized
            />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.08] bg-white/[0.08]">
            {PROOF.map((p) => (
              <div key={p.label} className="bg-[#0F1525] p-4">
                <dt className="font-mono text-[11px] uppercase tracking-[0.16em] text-[#94A3B8]">
                  {p.label}
                </dt>
                <dd className="mt-1 font-semibold text-white">{p.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {PROGRAMS.map((p) => (
              <li key={p.name}>
                <div className="h-full rounded-2xl border border-white/[0.08] bg-[#111827] p-5">
                  <h2 className="font-display text-2xl font-bold uppercase text-white">{p.name}</h2>
                  <p className="mt-1 text-sm font-medium text-[#C8F400]">{p.who}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#94A3B8]">{p.detail}</p>
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-4 rounded-2xl border border-[#C8F400]/25 bg-[#C8F400]/[0.05] p-5 text-sm leading-relaxed text-[#CBD5E1]">
            Pay for coaching here on the website. Your schedule, sessions and coach updates are in
            the app — sign in with the same phone number.
          </div>
        </div>
      </div>
      <div id="plans" className="mx-auto max-w-7xl scroll-mt-20 px-4 pb-20 sm:px-6">
        <CoachingPlans data={plans} />
      </div>
    </>
  );
}
