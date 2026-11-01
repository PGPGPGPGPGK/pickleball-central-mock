import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { CONTACT, HOURS, NAV, STORES } from "@/lib/site";
import { Icon } from "./Icon";

/** Compact footer: where to go, how to get here, how to reach us. */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#070B16]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="Pickleball Central — home">
            <Image src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`} alt="" width={44} height={44} className="h-11 w-11" />
            <span className="font-display text-xl font-extrabold uppercase leading-[0.9] text-white">
              Pickleball
              <br />
              Central
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#94A3B8]">
            Four pro courts in {CONTACT.locality}. Book online — no app needed.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <StoreLink href={STORES.android} label="Google Play" />
            <StoreLink href={STORES.ios} label="App Store" />
          </div>
        </div>

        <FooterCol title="Explore">
          {NAV.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            </li>
          ))}
        </FooterCol>

        <FooterCol title="Visit">
          <li>
            <address className="not-italic">
              {CONTACT.name}
              <br />
              {CONTACT.locality} {CONTACT.postcode}
            </address>
          </li>
          <li>{HOURS}</li>
          <li>
            <a
              href={CONTACT.directions}
              className="inline-flex items-center gap-1.5 text-[#C8F400] hover:underline"
            >
              Get directions <Icon name="arrow-right" className="h-4 w-4" />
            </a>
          </li>
        </FooterCol>

        <FooterCol title="Contact">
          <li>
            <a href={CONTACT.phoneHref} className="hover:text-white">
              {CONTACT.phone}
            </a>
          </li>
          <li>
            <a href={`mailto:${CONTACT.email}`} className="hover:text-white">
              {CONTACT.email}
            </a>
          </li>
          <li>
            <a href={CONTACT.whatsappCommunity} className="hover:text-white">
              WhatsApp community
            </a>
          </li>
          <li>
            <a href={CONTACT.instagram} className="hover:text-white">
              Instagram
            </a>
          </li>
        </FooterCol>
      </div>
      {/* Legal-entity statement — kept verbatim from the previous footer: it
          links the brand to the registered entity for customers and for
          platform/KYC verification. */}
      <div className="mx-auto max-w-7xl px-4 pb-8 sm:px-6">
        <p className="max-w-[60ch] text-xs leading-relaxed text-[#94A3B8]">
          <span className="font-medium text-[#CBD5E1]">Pickleball Central</span> is a brand owned
          and operated by{" "}
          <Link href="/about" className="font-medium text-[#CBD5E1] hover:text-[#C8F400]">
            Snowflake Enterprises
          </Link>
          , a registered partnership firm &middot; GSTIN 36AFNFS2231R1ZC. All court bookings,
          memberships, coaching, events, and GST invoices are provided by Snowflake Enterprises.
        </p>
        <p className="mt-2 max-w-[60ch] text-xs text-[#94A3B8]">
          Registered office: P.15/2, Kakateya Nagar Colony, Habsiguda, Hyderabad, Telangana 500007
        </p>
      </div>
      <div className="border-t border-white/[0.06]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-5 text-xs text-[#94A3B8] sm:px-6">
          <span>&copy; 2026 Snowflake Enterprises &middot; All rights reserved</span>
          <Link href="/about" className="hover:text-[#CBD5E1]">
            About
          </Link>
          <Link href="/support" className="hover:text-[#CBD5E1]">
            Support
          </Link>
          <Link href="/privacy" className="hover:text-[#CBD5E1]">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-[#CBD5E1]">
            Terms
          </Link>
          <span className="sm:ml-auto">
            Made by{" "}
            <a
              href="https://talecrafters.in?ref=pickleballcentral"
              className="text-[#CBD5E1] hover:text-[#C8F400]"
            >
              Talecrafters
            </a>
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <h2 className="font-mono text-[11px] uppercase tracking-[0.18em] text-[#C8F400]">{title}</h2>
      <ul className="mt-4 space-y-2.5 text-sm text-[#CBD5E1]">{children}</ul>
    </div>
  );
}

function StoreLink({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="rounded-full border border-white/10 px-3.5 py-2 text-xs font-medium text-[#CBD5E1] transition-colors hover:border-[#C8F400]/50 hover:text-white"
    >
      {label}
    </a>
  );
}
