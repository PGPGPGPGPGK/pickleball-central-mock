// StructuredData — JSON-LD schemas for the landing page.
//
// Emitted as inline <script type="application/ld+json"> blocks inside the
// server-rendered page. Google consumes these for rich results:
//   - SportsActivityLocation   → local business + sports-specific markup,
//                                 powers "pickleball near me" rich results
//   - Organization             → identifies Snowflake Enterprises as parent
//   - FAQPage                  → FAQ rich results in SERPs
//   - BreadcrumbList           → breadcrumb trail (trivial for landing page
//                                 but future-proofs for nested pages)
//   - Event (summer camp)       → event rich result, powers "events near me"
//
// Each schema is validated against schema.org — test via:
//   https://validator.schema.org/
//   https://search.google.com/test/rich-results

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickleball-central.co.in";

// Real facility data pulled from Pickleball Central's Google Business
// Profile (place ID 0x3bcb9fb0250aca5b:0x87124b8a05cb8cbb). NAP must stay
// consistent with the footer, LocationHours component, and GBP listing.
// TODO(ops): confirm final street-level address + postcode.
const FACILITY = {
  name: "Pickleball Central",
  url: SITE_URL,
  telephone: "+91-97007-44634",
  email: "hi@pickleball-central.co.in",
  streetAddress: "Peerzadiguda",
  addressLocality: "Hyderabad",
  addressRegion: "Telangana",
  postalCode: "500039",
  addressCountry: "IN",
  latitude: 17.391391,
  longitude: 78.611158,
};

import { FAQ_ITEMS } from "./faq-data";

export function StructuredData() {
  // Derive FAQ items from the shared source in faq-data.ts — single
  // source of truth so the on-page accordion and the JSON-LD schema
  // stay in sync. Must be a plain .ts module (not Faq.tsx which is a
  // client component) because Next mangles non-component exports
  // across the 'use client' boundary.
  const faqs = FAQ_ITEMS.map((f) => ({ question: f.q, answer: f.a }));
  // ── SportsActivityLocation (local business, most specific schema) ─
  const sportsLocationSchema = {
    "@context": "https://schema.org",
    "@type": ["SportsActivityLocation", "LocalBusiness"],
    "@id": `${SITE_URL}/#facility`,
    name: FACILITY.name,
    description:
      "Hyderabad's premier pickleball facility. 4 professional courts, coaching, tournaments, summer camps, on-site café and nail studio.",
    url: FACILITY.url,
    telephone: FACILITY.telephone,
    email: FACILITY.email,
    image: `${SITE_URL}/og-default.png`,
    priceRange: "₹₹",
    currenciesAccepted: "INR",
    paymentAccepted: ["Credit Card", "Debit Card", "UPI", "Cash"],
    address: {
      "@type": "PostalAddress",
      streetAddress: FACILITY.streetAddress,
      addressLocality: FACILITY.addressLocality,
      addressRegion: FACILITY.addressRegion,
      postalCode: FACILITY.postalCode,
      addressCountry: FACILITY.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: FACILITY.latitude,
      longitude: FACILITY.longitude,
    },
    // Neighbouring East-Hyderabad localities the facility genuinely serves
    // (Peerzadiguda is adjacent to Uppal). Mirrors the on-page "areas we serve"
    // copy in LocationHours.tsx and the FAQ — honest local-SEO signal.
    areaServed: [
      "Peerzadiguda",
      "Uppal",
      "Habsiguda",
      "Nacharam",
      "Boduppal",
      "Ghatkesar",
      "Hyderabad",
    ].map((name) => ({ "@type": "Place", name })),
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        opens: "06:00",
        closes: "23:00",
      },
    ],
    amenityFeature: [
      { "@type": "LocationFeatureSpecification", name: "Professional Courts", value: true },
      { "@type": "LocationFeatureSpecification", name: "Coaching", value: true },
      { "@type": "LocationFeatureSpecification", name: "Tournaments", value: true },
      { "@type": "LocationFeatureSpecification", name: "Café", value: true },
      { "@type": "LocationFeatureSpecification", name: "Nail Studio", value: true },
      { "@type": "LocationFeatureSpecification", name: "Equipment Rental", value: true },
      { "@type": "LocationFeatureSpecification", name: "Parking", value: true },
      { "@type": "LocationFeatureSpecification", name: "Wi-Fi", value: true },
    ],
    sport: "Pickleball",
    makesOffer: [
      {
        "@type": "Offer",
        name: "Court Booking",
        description: "Hourly court rental (inclusive of taxes)",
        priceCurrency: "INR",
        price: "600",
      },
      {
        "@type": "Offer",
        name: "Member Court Booking",
        description: "Hourly court rental for members",
        priceCurrency: "INR",
        price: "250",
      },
      // Coaching is intentionally absent from makesOffer: program prices are
      // admin-configured and sold in the app, and the ₹800 that used to sit
      // here came from the retired /coaches page's mock data.
      {
        "@type": "Offer",
        name: "Monthly Membership",
        description: "Club membership — monthly plan (18% GST inclusive)",
        priceCurrency: "INR",
        price: "2500",
      },
      {
        "@type": "Offer",
        name: "Annual Membership",
        description: "Club membership — 12-month plan, ₹1,500 a month (18% GST inclusive)",
        priceCurrency: "INR",
        price: "18000",
      },
    ],
    parentOrganization: {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "Snowflake Enterprises",
      legalName: "Snowflake Enterprises",
      taxID: "36AFNFS2231R1ZC",
    },
    // Aggregate from Pickleball Central's Google Business Profile.
    // Update reviewCount as new reviews come in (or wire to GBP API later).
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.9",
      reviewCount: "40",
      bestRating: "5",
      worstRating: "1",
    },
    // 6 verbatim review snippets — keep in sync with Testimonials.tsx.
    // Google ingests these into the rich result and may surface 1–3 in SERPs.
    review: [
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Junaid Bhat" },
        reviewBody: "Best pickle ball court in hyderabad ♥️",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Abhishek Yadav" },
        reviewBody:
          "The courts are very good and the maintenance is also very good. The tournament organisation was amazing — me and my partner enjoyed a lot.",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Hari Gopal" },
        reviewBody:
          "Played pickleball for the first time — simple to learn, super fun, and surprisingly addictive!",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Sundar Vummiti" },
        reviewBody:
          "Best time to play is from 9:30pm onwards. Court is well maintained and spacious.",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Chaitanya Gone" },
        reviewBody:
          "Excellent management! The parking area was well organized, and the staff received us with great courtesy.",
      },
      {
        "@type": "Review",
        reviewRating: { "@type": "Rating", ratingValue: "5", bestRating: "5" },
        author: { "@type": "Person", name: "Bhanu Chander" },
        reviewBody:
          "I recently visited the Pickleball Central court near Uppal and totally loved it! The place is really big with nice setup.",
      },
    ],
  };

  // ── FAQPage schema ────────────────────────────────────────────────
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  // ── BreadcrumbList (trivial for landing, useful when expanded) ───
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: SITE_URL,
      },
    ],
  };

  // ── Organization (parent company) ──────────────────────────────────
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: "Snowflake Enterprises",
    // legalName + alternateName give crawlers (and platform reviewers who
    // check public signals during KYC/verification) a machine-readable link
    // between the registered entity and the "Pickleball Central" brand.
    legalName: "Snowflake Enterprises",
    alternateName: "Pickleball Central",
    brand: {
      "@type": "Brand",
      name: "Pickleball Central",
    },
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    taxID: "36AFNFS2231R1ZC",
    vatID: "36AFNFS2231R1ZC",
    // Registered office = principal place of business on the GST certificate
    // (REG-06). Differs from the facility/venue address in the
    // SportsActivityLocation schema. Keep in sync with the /about page + footer.
    address: {
      "@type": "PostalAddress",
      streetAddress: "P.15/2, Kakateya Nagar Colony, Habsiguda",
      addressLocality: "Hyderabad",
      addressRegion: "Telangana",
      postalCode: "500007",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: FACILITY.telephone,
        email: FACILITY.email,
        contactType: "customer support",
        areaServed: "IN",
        availableLanguage: ["English", "Hindi", "Telugu"],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(sportsLocationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
    </>
  );
}
