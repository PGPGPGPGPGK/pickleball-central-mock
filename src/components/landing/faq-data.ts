// FAQ content — shared source of truth between the Faq.tsx client
// component (renders the accordion) and the StructuredData server
// component (emits JSON-LD schema).
//
// This must live in its own module (not inside Faq.tsx) because Next's
// 'use client' boundary mangles non-component exports when a server
// component imports them. A plain .ts module with no 'use client'
// directive works for both.

export const FAQ_ITEMS = [
  {
    q: "How much does it cost to play pickleball at Pickleball Central?",
    a: "Drop-in rate is ₹600 per hour for non-members, inclusive of all taxes. Members get significantly discounted rates plus free hours, priority booking, and F&B discounts — see our membership plans.",
    link: { href: "/membership", label: "See membership plans" },
  },
  {
    q: "Where is Pickleball Central located?",
    a: 'Peerzadiguda, Hyderabad. Tap "Get Directions" in the Location section above for turn-by-turn Google Maps directions, or call us and we will guide you in. Parking is available on-site.',
  },
  {
    q: "Which areas do you serve?",
    a: "We are in Peerzadiguda, right next to Uppal, so we are an easy drive for players across East Hyderabad — Uppal, Habsiguda, Nacharam, Boduppal, and Ghatkesar are all just minutes away. On-site parking makes drop-in play simple.",
  },
  {
    q: "Do I need to bring my own paddle?",
    a: "No — paddles are always free of cost at Pickleball Central. Rentals at reception, balls included, every session. If you prefer your own gear, we also stock pro paddles in the club shop.",
  },
  {
    q: "Can beginners play pickleball here?",
    a: "Absolutely. We run beginner clinics every Saturday morning and private starter lessons through the app. Most new players are playing their first real rally within 15 minutes — pickleball has one of the shortest learning curves in racquet sports.",
    link: { href: "/#coaching", label: "See the beginner batch" },
  },
  {
    q: "What are your operating hours?",
    a: "Monday to Thursday: 6 AM – 10 PM. Friday to Sunday: 6 AM – 3 AM (next day) — late-night pickleball on weekends. Courts can be booked up to 14 days in advance through the mobile app or at reception.",
  },
  {
    q: "Do you offer coaching?",
    a: "Yes. Coaching at Pickleball Central runs on monthly programs — structured batches for beginners, intermediate, and advanced players, as well as private sessions. Batch timings and current pricing are in the app — enrol there, or ask us on WhatsApp.",
    link: { href: "/#coaching", label: "See coaching programs" },
  },
  {
    q: "Do you host tournaments?",
    a: "Yes — internal tournaments, hosted once a month, open to everyone playing at Pickleball Central. Singles, doubles, and mixed doubles across skill levels. Registrations open roughly 2 weeks ahead.",
    link: { href: "/download", label: "Get the app" },
  },
  {
    q: "Is there a café on-site?",
    a: "Yes — Mini Alley Pally Cafe is right off the courts, open 7 AM to 9 PM. Cold-pressed juices, protein bowls, smoothies, and coffee. There is also an on-site Nail Art Studio next door.",
  },
  {
    q: "How do I become a member?",
    a: "Pick a plan on the Membership page or download the app and sign up in 2 minutes. One membership, four commitment lengths — ₹2,500 monthly, ₹6,000 quarterly, ₹10,000 half-yearly or ₹18,000 for the year (₹1,500 a month). The monthly plan can be cancelled anytime, and every price includes GST.",
    link: { href: "/membership", label: "View plans" },
  },
  {
    q: "Do you run summer camps?",
    a: "Yes, we run structured summer camps for kids and teens. Daily coaching, match play, and all equipment provided. Registrations opening soon — reach out on WhatsApp for the latest dates and availability.",
    link: { href: "#summer-camp", label: "Summer Camp details" },
  },
] as const;

export type FaqItem = (typeof FAQ_ITEMS)[number];
