/**
 * One source for the facts every page repeats — copied verbatim from the
 * existing site (LocationHours, Hero, MobileApp, FloatingMenu). Change a fact
 * here, not in a page.
 */
const R2 = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? "";

/** Public R2 asset URL (photos, posters, hero video, app screenshots). */
export const r2 = (path: string): string => `${R2}/${path.replace(/^\//, "")}`;

export const NAV = [
  { label: "Book a Court", href: "/play" },
  { label: "Tournaments", href: "/tournaments" },
  { label: "Coaching", href: "/coaching" },
  { label: "Membership", href: "/membership" },
  { label: "The App", href: "/download" },
  { label: "The Venue", href: "/venue" },
] as const;

export const CONTACT = {
  name: "Pickleball Central",
  locality: "Peerzadiguda, Hyderabad",
  postcode: "500039",
  phone: "+91 97007 44634",
  phoneHref: "tel:+919700744634",
  email: "hi@pickleball-central.co.in",
  whatsappChat: "https://wa.me/919700744634",
  whatsappCommunity: "https://chat.whatsapp.com/HLVDJubO2B3FfLLBqS9KiU",
  instagram: "https://www.instagram.com/pickleballcentralhyd",
  directions:
    "https://www.google.com/maps/dir/?api=1&destination=17.391391,78.611158&destination_place_id=ChIJW8rKJbCfyzsRu4zLBYpLEoc",
  areas: "Uppal, Habsiguda, Nacharam, Boduppal & Ghatkesar",
} as const;

export const HOURS = "6:00 AM – 11:00 PM, every day";

/** The Hero's own fact row. */
export const FACTS = ["4 Pro Courts", "Open 6am–11pm", "4.9★ on Google", "Peerzadiguda, Hyderabad"];

export const STORES = {
  android:
    "https://play.google.com/store/apps/details?id=com.snowflakeenterprises.pickleballcentral",
  ios: "https://apps.apple.com/in/app/pickleball-central/id6787500349",
} as const;

/** The app's own feature claims (download page + MobileApp section). */
export const APP_FEATURES = [
  "Book a court in seconds",
  "Join tournaments + track rankings",
  "Find partners at your skill level",
  "Manage your membership + perks",
  "Order café F&B direct to your court",
] as const;

/**
 * Real venue photography on R2, with the alt text the old sections used.
 * `letterbox`: the file is a 16:9 frame with ~12% black bars baked in top and
 * bottom; render it with LETTERBOX_CROP so the bars never show.
 */
export const PHOTOS = {
  facility: {
    letterbox: true,
    src: r2("images/photos/facility-wide.jpg"),
    alt: "Pickleball Central facility at night — lit courts with Mini Alley Pally cafe visible",
  },
  match: {
    src: r2("images/photos/SBH07998.jpg"),
    alt: "Tournament match in progress at Pickleball Central Hyderabad",
  },
  coach: {
    src: r2("images/photos/head-coach.jpg"),
    alt: "Certified pickleball coach at Pickleball Central Hyderabad giving instruction on court",
  },
  player: {
    letterbox: true,
    src: r2("images/photos/female-player.jpg"),
    alt: "Member playing a tournament match at Pickleball Central Hyderabad",
  },
  cafe: {
    letterbox: true,
    src: r2("images/photos/mini-alley-pally.jpg"),
    alt: "Mini Alley Pally Cafe — on-site container-style café at Pickleball Central with fairy lights and express menu",
  },
  nails: {
    src: r2("images/photos/nail-studio.jpg"),
    alt: "Nail Art Studio at Pickleball Central — on-site salon with circular sign, polish display, and manicure station",
  },
} as const;

/** Scales a letterboxed photo just enough (1080/818) to push the bars out of frame. */
export const LETTERBOX_CROP = "scale-[1.32]";

export type Photo = { src: string; alt: string; letterbox?: boolean };

export const HERO_VIDEO = {
  poster: r2("images/hero-poster.jpg"),
  sources: [
    { src: r2("videos/hero-pickleball-720.webm"), type: "video/webm", media: "(max-width: 767px)" },
    { src: r2("videos/hero-pickleball-720.mp4"), type: "video/mp4", media: "(max-width: 767px)" },
    { src: r2("videos/hero-pickleball.webm"), type: "video/webm" },
    { src: r2("videos/hero-pickleball.mp4"), type: "video/mp4" },
  ],
} as const;

/**
 * Real app screenshots on R2 (720×1566). `crop` shows only the top of a
 * screen: home.png's lower half carries an expired summer-camp card and old
 * offer codes, which must not read as live offers. The app's intro
 * illustrations are not used — they carry mock coaches, prices and tiers.
 */
export const APP_SCREENS = [
  {
    src: r2("images/app/book.png"),
    alt: "Pickleball Central app booking screen — pick a day, duration and start time; ₹600 per hour",
    caption: "Book a court in seconds",
    crop: false,
  },
  {
    src: r2("images/app/home.png"),
    alt: "Pickleball Central app home screen with Book Court, F&B Order and Find Coach shortcuts",
    caption: "Courts, café orders and coaches from the home screen",
    crop: true,
  },
] as const;
