import type { Metadata } from "next";
import Link from "next/link";

import { AppCarousel } from "@/components/site/AppCarousel";
import { btnPrimary, btnSecondary } from "@/components/site/ui";
import { APP_FEATURES } from "@/lib/site";
import { Icon } from "@/components/site/Icon";

export const metadata: Metadata = {
  title: "Get the App",
  description:
    "Download the Pickleball Central app to book courts, manage your membership, join tournaments, find partners, and order from the café — all from one place.",
  alternates: { canonical: "/download" },
  openGraph: {
    title: "Download — Pickleball Central",
    description:
      "Book courts, join tournaments, find partners. The official app of Pickleball Central Peerzadiguda.",
    url: "/download",
    type: "website",
  },
};

// Both stores are live: Android on Google Play, iOS on the App Store. Override
// either URL via NEXT_PUBLIC_PLAY_STORE_URL / NEXT_PUBLIC_APP_STORE_URL.
const PLAY_STORE_URL =
  process.env.NEXT_PUBLIC_PLAY_STORE_URL ??
  "https://play.google.com/store/apps/details?id=com.snowflakeenterprises.pickleballcentral";
const APP_STORE_URL =
  process.env.NEXT_PUBLIC_APP_STORE_URL ??
  "https://apps.apple.com/in/app/pickleball-central/id6787500349";

export default function DownloadPage() {
  return (
    <div className="mx-auto grid max-w-7xl gap-12 px-4 pb-20 pt-10 sm:px-6 md:pt-16 lg:grid-cols-[1.05fr_1fr] lg:items-center">
      <div>
        <h1 className="font-display text-[44px] font-extrabold uppercase leading-[0.92] text-white md:text-7xl">
          Pickleball Central <span className="text-[#C8F400]">in your pocket</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-[#CBD5E1] md:text-lg">
          Booking, memberships, tournaments, and the café, all in one app. Free on iOS and Android.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <a href={PLAY_STORE_URL} className={btnPrimary}>
            Get it on Google Play
          </a>
          <a href={APP_STORE_URL} className={btnSecondary}>
            Download on the App Store
          </a>
        </div>

        <ul className="mt-9 grid gap-2.5 sm:grid-cols-2">
          {APP_FEATURES.map((f) => (
            <li
              key={f}
              className="flex items-start gap-3 rounded-xl border border-white/[0.08] bg-[#111827] p-3.5 text-sm text-[#E2E8F0]"
            >
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C8F400]"
              />
              {f}
            </li>
          ))}
        </ul>

        <p className="mt-8 rounded-2xl border border-white/[0.08] p-4 text-sm text-[#CBD5E1]">
          <strong className="text-white">No app? No problem.</strong> Courts can be booked right
          here on the website too: same courts, same live availability.{" "}
          <Link href="/play" className="font-medium text-[#C8F400] hover:underline">
            <span className="inline-flex items-center gap-1.5 align-middle">
              Book on the web <Icon name="arrow-right" className="h-4 w-4" />
            </span>
          </Link>
        </p>
      </div>

      <AppCarousel />
    </div>
  );
}
