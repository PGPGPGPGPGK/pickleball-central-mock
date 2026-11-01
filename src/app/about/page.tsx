import type { Metadata } from "next";
import Link from "next/link";

import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Pickleball Central is a brand owned and operated by Snowflake Enterprises — Hyderabad's premier pickleball facility in Peerzadiguda, with pro courts, coaching, tournaments, events, and an on-site café.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Us — Pickleball Central",
    description:
      "Pickleball Central is a brand owned and operated by Snowflake Enterprises — Hyderabad's premier pickleball facility.",
    url: "/about",
    type: "website",
  },
};

const EMAIL = "hi@pickleball-central.co.in";
const PHONE_DISPLAY = "+91 97007 44634";
const PHONE_TEL = "+919700744634";

// Legal entity details — must match the GST certificate and the details
// submitted to Meta / payment partners exactly. GSTIN and facility mirror the
// footer and StructuredData. Registered office differs from the facility.
const COMPANY = {
  brand: "Pickleball Central",
  legalName: "Snowflake Enterprises",
  constitution: "a registered partnership firm",
  gstin: "36AFNFS2231R1ZC",
  // Registered office = principal place of business on the GST certificate
  // (REG-06). Differs from the facility/venue below. Keep in exact sync with
  // the GST certificate and the details submitted to Meta / payment partners.
  registeredOffice: "P.15/2, Kakateya Nagar Colony, Habsiguda, Hyderabad, Telangana 500007, India",
  facility: "Peerzadiguda, Hyderabad, Telangana 500039, India",
};

export default function AboutPage() {
  return (
    <LegalLayout
      title="About Us"
      lastUpdated="7 July 2026"
      intro={
        <>
          <p>
            <strong className="text-white">Pickleball Central</strong> is Hyderabad&rsquo;s premier
            pickleball destination — four professional courts, certified coaching, tournaments,
            summer camps, community events, and an on-site café, in Peerzadiguda, East Hyderabad. We
            exist to grow the game: to get more people on court, more often, and to build a warm,
            competitive pickleball community in the city.
          </p>
          <p>
            <strong className="text-white">
              Pickleball Central is a brand owned and operated by Snowflake Enterprises
            </strong>{" "}
            (GSTIN {COMPANY.gstin}). &ldquo;Pickleball Central&rdquo; is the trading name under
            which Snowflake Enterprises runs the facility, this website, and the Pickleball Central
            mobile app.
          </p>
        </>
      }
    >
      <LegalSection heading="Who operates Pickleball Central">
        <p>
          The facility, this website (
          <Link href="/" className="text-[#C8F400] hover:underline">
            pickleball-central.co.in
          </Link>
          ), and the Pickleball Central mobile app are owned and operated by{" "}
          <strong className="text-white">{COMPANY.legalName}</strong>, {COMPANY.constitution}{" "}
          registered in India (GSTIN {COMPANY.gstin}), with its registered office at{" "}
          {COMPANY.registeredOffice}. Pickleball Central is our consumer-facing brand; Snowflake
          Enterprises is the legal entity behind it. All bookings, memberships, payments, and GST
          invoices are issued by Snowflake Enterprises under GSTIN {COMPANY.gstin}.
        </p>
      </LegalSection>

      <LegalSection heading="Company information">
        <LegalList>
          <li>
            Brand: <strong className="text-white">{COMPANY.brand}</strong>
          </li>
          <li>
            Legal entity: <strong className="text-white">{COMPANY.legalName}</strong> (
            {COMPANY.constitution})
          </li>
          <li>GSTIN: {COMPANY.gstin}</li>
          <li>Registered office: {COMPANY.registeredOffice}</li>
          <li>Facility / venue: {COMPANY.facility}</li>
          <li>
            Email:{" "}
            <a href={`mailto:${EMAIL}`} className="text-[#C8F400] hover:underline">
              {EMAIL}
            </a>
          </li>
          <li>
            Phone / WhatsApp:{" "}
            <a href={`tel:${PHONE_TEL}`} className="text-[#C8F400] hover:underline">
              {PHONE_DISPLAY}
            </a>
          </li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="What we offer">
        <LegalList>
          <li>Four professional pickleball courts, open daily 6 AM – 11 PM.</li>
          <li>Certified coaching, private sessions, and youth summer camps.</li>
          <li>Tournaments, ladders, and community events for every level.</li>
          <li>Memberships with priority booking, free hours, and F&amp;B perks.</li>
          <li>An on-site café and player amenities.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="Visit us">
        <p>
          You&rsquo;ll find us in {COMPANY.facility}, serving Peerzadiguda, Uppal, Habsiguda,
          Nacharam, Boduppal, Ghatkesar, and greater Hyderabad. Come play a game, join a session, or
          just watch — everyone&rsquo;s welcome.
        </p>
      </LegalSection>

      <LegalSection heading="Get in touch">
        <p>
          For bookings, memberships, coaching, events, or any question, reach us on{" "}
          <Link href="/support" className="text-[#C8F400] hover:underline">
            our support page
          </Link>
          , by email at{" "}
          <a href={`mailto:${EMAIL}`} className="text-[#C8F400] hover:underline">
            {EMAIL}
          </a>
          , or by phone / WhatsApp at{" "}
          <a href={`tel:${PHONE_TEL}`} className="text-[#C8F400] hover:underline">
            {PHONE_DISPLAY}
          </a>
          . See also our{" "}
          <Link href="/terms" className="text-[#C8F400] hover:underline">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-[#C8F400] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
