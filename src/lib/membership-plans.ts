// Membership pricing — single source of truth for the marketing surfaces.
//
// Structure changed 2026-09-03 (owner call): the old three perk tiers
// (STARTER ₹2,999 / PRO ₹5,999 / ELITE ₹9,999 per month) are retired. There is
// now ONE Pickleball Central membership, sold at four commitment lengths. The
// struck-through figure on each card is the plain monthly rate × the number of
// months, so the saving is arithmetic rather than a marketing claim:
//
//   Monthly      ₹2,500                      —
//   Quarterly    ₹6,000   was ₹7,500   (3 × ₹2,500)   save 20%
//   Half-yearly  ₹10,000  was ₹15,000  (6 × ₹2,500)   save 33%
//   Yearly       ₹18,000  was ₹30,000  (12 × ₹2,500)  save 40%
//
// Deliberately NO itemised perk list: the perks a membership grants are
// admin-configured on the membership_plans rows and are still being finalised,
// so printing a fixed list here would drift from what the app actually sells.
//
// Keep in step with `packages/db/scripts/seed-membership-plans.ts`, which
// writes the same four prices into the database the app sells from.

export type MembershipDurationPlan = {
  id: string;
  /** Card heading, e.g. "QUARTERLY". */
  name: string;
  /** Price actually charged, pre-formatted in rupees. */
  price: string;
  /** Undiscounted equivalent (months × ₹2,500); null for the monthly plan. */
  strikePrice: string | null;
  /** e.g. "for 3 months" */
  priceUnit: string;
  /** e.g. "Save 20%"; null for the monthly plan. */
  savingLabel: string | null;
  /** One-line positioning. */
  description: string;
  /** The single "most popular" card. */
  featured: boolean;
  badge?: string;
};

export const MONTHLY_RATE_LABEL = "₹2,500";

export const MEMBERSHIP_PLANS: MembershipDurationPlan[] = [
  {
    id: "monthly",
    name: "MONTHLY",
    price: "₹2,500",
    strikePrice: null,
    priceUnit: "per month",
    savingLabel: null,
    description: "Month to month. Try the club with nothing locked in.",
    featured: false,
  },
  {
    id: "quarterly",
    name: "QUARTERLY",
    price: "₹6,000",
    strikePrice: "₹7,500",
    priceUnit: "for 3 months",
    savingLabel: "Save 20%",
    description: "One season of steady play, at ₹2,000 a month.",
    featured: false,
  },
  {
    id: "half-yearly",
    name: "HALF-YEARLY",
    price: "₹10,000",
    strikePrice: "₹15,000",
    priceUnit: "for 6 months",
    savingLabel: "Save 33%",
    description: "Six months on court, at ₹1,667 a month.",
    featured: true,
    badge: "Most Popular",
  },
  {
    id: "yearly",
    name: "YEARLY",
    price: "₹18,000",
    strikePrice: "₹30,000",
    priceUnit: "for 12 months",
    savingLabel: "Save 40%",
    description: "The best rate we offer — ₹1,500 a month, all year.",
    featured: false,
  },
];
