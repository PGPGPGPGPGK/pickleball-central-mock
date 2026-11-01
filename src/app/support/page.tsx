import type { Metadata } from "next";
import Link from "next/link";

import { LegalLayout, LegalSection, LegalList } from "@/components/legal/LegalLayout";

export const metadata: Metadata = {
  title: "Support",
  description:
    "Get help with Pickleball Central — court bookings, memberships, coaching, tournaments, events, payments, and refunds. Reach us by email, phone, or WhatsApp.",
  alternates: { canonical: "/support" },
  openGraph: {
    title: "Support — Pickleball Central",
    description:
      "Get help with bookings, memberships, coaching, events, payments, and refunds. Reach us by email, phone, or WhatsApp.",
    url: "/support",
    type: "website",
  },
};

const EMAIL = "hi@pickleball-central.co.in";
const PHONE_DISPLAY = "+91 97007 44634";
const PHONE_TEL = "+919700744634";
const WHATSAPP = "https://wa.me/919700744634";

export default function SupportPage() {
  return (
    <LegalLayout
      title="Support"
      lastUpdated="7 July 2026"
      intro={
        <>
          <p>
            Need a hand? Whether it&rsquo;s a court booking, a membership question, a payment or
            refund, or help with the app, the{" "}
            <strong className="text-white">
              Pickleball Central, a unit of Snowflake Enterprises
            </strong>{" "}
            team is here to help. We&rsquo;re a sports facility located in Peerzadiguda, Hyderabad,
            Telangana, India (GSTIN 36AFNFS2231R1ZC).
          </p>
          <p>
            The fastest way to reach us is by email or phone — details are below. We usually respond
            within one business day.
          </p>
        </>
      }
    >
      <LegalSection heading="Contact us">
        <LegalList>
          <li>
            Email:{" "}
            <a href={`mailto:${EMAIL}`} className="text-[#C8F400] hover:underline">
              {EMAIL}
            </a>
          </li>
          <li>
            Phone:{" "}
            <a href={`tel:${PHONE_TEL}`} className="text-[#C8F400] hover:underline">
              {PHONE_DISPLAY}
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#C8F400] hover:underline"
            >
              {PHONE_DISPLAY}
            </a>
          </li>
          <li>Address: Peerzadiguda, Hyderabad, Telangana, India</li>
          <li>Hours: Open daily, 6 AM – 11 PM IST</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="What we can help with">
        <LegalList>
          <li>Court bookings — availability, changes, reschedules, and cancellations.</li>
          <li>Memberships and subscriptions — plans, renewals, benefits, and cancellations.</li>
          <li>Coaching sessions, summer camps, tournaments, and events.</li>
          <li>Payments, GST invoices, and refunds.</li>
          <li>Your account and login (phone number and OTP).</li>
          <li>The mobile app — installing, updating, and troubleshooting.</li>
        </LegalList>
      </LegalSection>

      <LegalSection heading="Bookings, payments, and refunds">
        <p>
          Cancellations and refunds are governed by the cancellation policy shown to you before you
          confirm and pay. Eligible refunds are processed back to your original payment method
          through our payment partner, Razorpay, and may take several business days to reflect
          depending on your bank. For anything payment-related, please have your booking or invoice
          number ready so we can help you faster. See our{" "}
          <Link href="/terms" className="text-[#C8F400] hover:underline">
            Terms of Service
          </Link>{" "}
          for full details.
        </p>
      </LegalSection>

      <LegalSection heading="Privacy and your data">
        <p>
          To access, correct, or delete your personal data, or to raise a privacy concern, email us
          at{" "}
          <a href={`mailto:${EMAIL}`} className="text-[#C8F400] hover:underline">
            {EMAIL}
          </a>{" "}
          or call{" "}
          <a href={`tel:${PHONE_TEL}`} className="text-[#C8F400] hover:underline">
            {PHONE_DISPLAY}
          </a>
          . Full details are in our{" "}
          <Link href="/privacy" className="text-[#C8F400] hover:underline">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection heading="About us">
        <p>
          Pickleball Central is a unit of Snowflake Enterprises — Hyderabad&rsquo;s premier
          pickleball facility, with pro courts, an on-site café, and coaching, tournaments, and
          events for players of every level.
        </p>
      </LegalSection>
    </LegalLayout>
  );
}
