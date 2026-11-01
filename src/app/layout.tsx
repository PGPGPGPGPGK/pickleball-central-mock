import type { Metadata, Viewport } from "next";
import { Barlow_Condensed, DM_Sans, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/SiteFooter";
import { SiteHeader } from "@/components/site/SiteHeader";

// Google Tag Manager + Microsoft Clarity. Both IDs are public (they ship in
// page source), so we default them in code — guarantees they load in prod even
// though the env templates ship NEXT_PUBLIC_GTM_ID / NEXT_PUBLIC_CLARITY_ID as
// empty placeholders. `??` is wrong here: it keeps an empty-string env (the
// templates' default) instead of falling back, so analytics would silently not
// load. This helper treats empty/whitespace as "unset" and uses the default.
function envIdOrDefault(value: string | undefined, fallback: string): string {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : fallback;
}

// The local preview (NEXT_PUBLIC_PREVIEW_MOCKS=1) loads no analytics, so
// reviewing the site never sends page views or conversions to production tags.
const NO_TAGS = process.env.NEXT_PUBLIC_PREVIEW_MOCKS === "1" || process.env.NEXT_PUBLIC_DEMO === "1";
const tagId = (value: string | undefined, fallback: string): string =>
  NO_TAGS ? "" : envIdOrDefault(value, fallback);

const GTM_ID = tagId(process.env.NEXT_PUBLIC_GTM_ID, "GTM-5WRG2KMN");
const CLARITY_ID = tagId(process.env.NEXT_PUBLIC_CLARITY_ID, "x8o12if7dw");
// Meta (Facebook) Pixel — public id, defaulted in code like GTM/Clarity so it
// always loads in prod even when the env template ships an empty placeholder.
const META_PIXEL_ID = tagId(process.env.NEXT_PUBLIC_META_PIXEL_ID, "27486896350905332");
// URL Genius smart app banner — shows a "get the app" install banner on
// mobile (self-detects device + store). Public banner id, defaulted in code
// like the analytics ids above so it always loads in prod even when the env
// template ships an empty placeholder.
const URLGENIUS_BANNER_ID = tagId(process.env.NEXT_PUBLIC_URLGENIUS_BANNER_ID, "db42816b106967b4");

import "./globals.css";

// R2 CDN host for hero video, bento photos, app screenshots, summer-camp posters.
// Preconnecting saves ~100–300ms on first asset fetch by paying the TLS
// handshake up-front rather than waiting for the first <Image> or <video>
// element to trigger it.
const R2_ORIGIN = (() => {
  try {
    const url = process.env.NEXT_PUBLIC_R2_PUBLIC_URL;
    return url ? new URL(url).origin : null;
  } catch {
    return null;
  }
})();

// ─────────────────────────────────────────────────────────────────
// Typography — DESIGN.md-aligned stack.
//
// Barlow Condensed  → display headlines (ALL CAPS, 600-900 weights)
// DM Sans           → body copy
// JetBrains Mono    → labels, timestamps, uppercase-tracked mono
//
// Each font exposes a CSS variable via `variable`. Tailwind picks
// those up via @theme inline in globals.css so the `font-display`,
// `font-sans`, `font-mono` utilities resolve correctly.
// ─────────────────────────────────────────────────────────────────

const barlowCondensed = Barlow_Condensed({
  variable: "--font-barlow-condensed",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
  display: "swap",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "600"],
  display: "swap",
});

// Site URL — override via NEXT_PUBLIC_SITE_URL for non-prod environments.
// Defaults to the production domain so SEO / og URLs resolve correctly even
// if the env var is missing at build time.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pickleball-central.co.in";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pickleball Central — Hyderabad",
    template: "%s · Pickleball Central",
  },
  description:
    "Hyderabad's premier pickleball facility. Book courts, join tournaments, track rankings, and find partners at Pickleball Central.",
  keywords: [
    "pickleball hyderabad",
    "pickleball court booking",
    "pickleball tournaments india",
    "pickleball coaching",
    "pickleball central",
  ],
  authors: [{ name: "Snowflake Enterprises" }],
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Pickleball Central",
    title: "Pickleball Central — Hyderabad",
    description:
      "Hyderabad's premier pickleball facility. Book courts, join tournaments, track rankings.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "Pickleball Central",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Pickleball Central — Hyderabad",
    description:
      "Hyderabad's premier pickleball facility. Book courts, join tournaments, track rankings.",
    images: ["/og-default.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
};

// Explicit viewport so browser chrome (address bar / PWA status bar)
// matches the navy theme on iOS + Android. Otherwise the bar flashes
// white against our dark-first design.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#0A0F1E" },
    { media: "(prefers-color-scheme: light)", color: "#0A0F1E" },
  ],
  width: "device-width",
  initialScale: 1,
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${barlowCondensed.variable} ${dmSans.variable} ${jetBrainsMono.variable} h-full antialiased`}
    >
      <head>
        {/* Preconnect to R2 CDN so the TLS handshake finishes before the
            first <video>/<Image> that needs it. Tangible LCP win on mobile. */}
        {R2_ORIGIN && (
          <>
            <link rel="preconnect" href={R2_ORIGIN} crossOrigin="anonymous" />
            <link rel="dns-prefetch" href={R2_ORIGIN} />
          </>
        )}
        {/* Google Tag Manager — loads as early as Next allows. */}
        {GTM_ID && (
          <Script id="gtm-base" strategy="afterInteractive">
            {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
          </Script>
        )}
        {/* Microsoft Clarity — session replay + heatmaps. */}
        {CLARITY_ID && (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`(function(c,l,a,r,i,t,y){
c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
})(window, document, "clarity", "script", "${CLARITY_ID}");`}
          </Script>
        )}
        {/* Meta (Facebook) Pixel — base code + PageView. Covers every Next
            route. The static /season5 page carries its own copy + conversion
            events (it's served from public/, outside this layout). */}
        {META_PIXEL_ID && (
          <Script id="meta-pixel" strategy="afterInteractive">
            {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,
'script','https://connect.facebook.net/en_US/fbevents.js');
fbq('init','${META_PIXEL_ID}');fbq('track','PageView');`}
          </Script>
        )}
        {/* URL Genius smart app banner — injects the banner loader, which
            self-detects mobile device + store and shows an install prompt.
            The loader appends the current page URL so click-throughs preserve
            context. Runs client-side (afterInteractive) so window.location is
            available. Note: if the banner fails to appear in prod, check the
            Cloudflare edge CSP allowlists `banner.urlgeni.us` under script-src. */}
        {URLGENIUS_BANNER_ID && (
          <Script id="urlgenius-smart-banner" strategy="afterInteractive">
            {`var head=document.getElementsByTagName('head')[0],script=document.createElement('script');script.type='text/javascript',script.src='https://banner.urlgeni.us/smart_banners/${URLGENIUS_BANNER_ID}.js?url='+encodeURI(window.location),head.appendChild(script);`}
          </Script>
        )}
      </head>
      <body className="min-h-full flex flex-col bg-[#0A0F1E] text-[#F8FAFC]">
        {/* Google Tag Manager (noscript) — immediately after <body>. */}
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: "none", visibility: "hidden" }}
              title="Google Tag Manager"
            />
          </noscript>
        )}
        {/* Meta Pixel (noscript) fallback. */}
        {META_PIXEL_ID && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              alt=""
              src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
            />
          </noscript>
        )}

        <p className="bg-amber-300 px-4 py-1.5 text-center text-xs font-semibold text-[#0A0F1E]">
          Clickable mock · sample data · no real bookings, payments or messages. Phone code: any 6 digits. Check-in code: try /checkin?code=demo
        </p>
        <SiteHeader />

        <main id="main" className="flex-1">
          {children}
        </main>

        {/* Footer */}
        <SiteFooter />
      </body>
    </html>
  );
}
