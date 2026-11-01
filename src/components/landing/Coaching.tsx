// Coaching section — homepage.
//
// Replaces the retired /coaches page (which listed four INVENTED coaches with
// fabricated names, star ratings and review counts). Everything here is a fact
// the business already publishes elsewhere on the site: coaching runs as
// monthly programs — structured batches for beginners, intermediate and
// advanced players, plus private sessions and a juniors track. Saturday
// beginner clinics and free paddles are the same facts stated in the FAQ.
//
// Deliberately NO prices and NO coach profiles: live coaching plans and their
// prices are admin-configured and sold in the app (GET /v1/coaching/plans), so
// the CTA sends players there rather than duplicating a number that can drift.

import Image from "next/image";
import Link from "next/link";

const R2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

const WA_ENQUIRY_NUMBER = "919700744634";
const WA_ENQUIRY_MESSAGE = encodeURIComponent(
  "Hi, I'd like to know more about coaching at Pickleball Central.",
);
export const WA_LINK = `https://wa.me/${WA_ENQUIRY_NUMBER}?text=${WA_ENQUIRY_MESSAGE}`;

export const PROGRAMS: { name: string; who: string; detail: string }[] = [
  {
    name: "Beginner Batch",
    who: "Never held a paddle",
    detail:
      "Grip, serve, dink and the kitchen rule, drilled in a small group. Most players are rallying inside their first session.",
  },
  {
    name: "Intermediate Batch",
    who: "You rally, you want to win",
    detail:
      "Third-shot drop, stacking, court positioning and shot selection — the pieces that separate social play from match play.",
  },
  {
    name: "Advanced Batch",
    who: "Tournament-bound",
    detail:
      "Speed-ups, resets, partner strategy and match simulation, built around the DUPR-rated events we run each month.",
  },
  {
    name: "Private Sessions",
    who: "One-on-one",
    detail:
      "A coach, a court and your specific problem. Book a single session or a block — schedule it around your own week.",
  },
];

export const PROOF: { label: string; value: string }[] = [
  { label: "Format", value: "Monthly programs" },
  { label: "Also", value: "Juniors & kids" },
  { label: "Clinics", value: "Saturday mornings" },
  { label: "Paddles", value: "Free, always" },
];

export function Coaching() {
  return (
    <section
      id="coaching"
      aria-labelledby="coaching-heading"
      className="relative overflow-hidden bg-[#0A0F1E] py-24 md:py-32"
    >
      {/* Teal-into-navy accent, distinct from the volt-heavy sections above */}
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-bl from-[#0D7377]/10 via-[#0A0F1E] to-[#0A0F1E]"
      />
      <div
        aria-hidden="true"
        className="absolute -left-32 top-1/3 h-[32rem] w-[32rem] rounded-full bg-[#C8F400]/[0.07] blur-[120px]"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 items-start gap-12 lg:grid-cols-12">
          {/* Left: heading, proof chips, photo */}
          <div className="lg:col-span-5">
            <span className="mb-4 inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400]">
              Coaching
            </span>
            <h2
              id="coaching-heading"
              className="mb-5 text-4xl font-extrabold uppercase leading-[0.95] tracking-tight text-white md:text-5xl lg:text-6xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              GET COACHED.
              <br />
              <span className="text-[#C8F400]">GET BETTER.</span>
            </h2>
            <p className="mb-8 max-w-lg text-base leading-relaxed text-[#94A3B8] md:text-lg">
              Coaching at Pickleball Central runs on monthly programs — structured batches for every
              level, plus private sessions when you want the court to yourself. Certified coaches,
              small groups, real match play.
            </p>

            <dl className="mb-8 grid max-w-lg grid-cols-2 gap-x-6 gap-y-4">
              {PROOF.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#475569]">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-sm font-bold text-[#F8FAFC]">{item.value}</dd>
                </div>
              ))}
            </dl>

            {R2 && (
              <div className="relative aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border border-[#2A3548]">
                <Image
                  src={`${R2}/images/photos/head-coach.jpg`}
                  alt="Certified pickleball coach giving on-court instruction at Pickleball Central, Peerzadiguda, Hyderabad"
                  fill
                  sizes="(min-width: 1024px) 40vw, 100vw"
                  className="object-cover"
                  style={{ objectPosition: "center top" }}
                  unoptimized
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-gradient-to-t from-[#0A0F1E] via-transparent to-transparent"
                />
              </div>
            )}
          </div>

          {/* Right: the programs */}
          <div className="lg:col-span-7">
            <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {PROGRAMS.map((program) => (
                <li
                  key={program.name}
                  className="rounded-2xl border border-[#2A3548] bg-[#111827]/70 p-6 transition-colors hover:border-[#C8F400]/40"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-[#C8F400]">
                    {program.who}
                  </p>
                  <h3
                    className="mt-2 text-xl font-bold uppercase tracking-tight text-white"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {program.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#94A3B8]">{program.detail}</p>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-2xl border border-[#C8F400]/25 bg-[#C8F400]/[0.05] p-6">
              <p className="text-sm leading-relaxed text-[#CBD5E1]">
                Live batch timings, coach availability and current program pricing are all in the
                app — pick a program, pay, and your slots are booked.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/download"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#C8F400] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#0A0F1E] shadow-[0_0_40px_-10px_rgba(200,244,0,0.6)] transition-all hover:bg-[#D8FF20]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Enrol in the app
                  <span aria-hidden="true">→</span>
                </Link>
                <a
                  href={WA_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl border border-[#2A3548] px-7 py-3.5 text-sm font-bold uppercase tracking-[0.1em] text-[#F8FAFC] transition-colors hover:border-[#C8F400] hover:text-[#C8F400]"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
