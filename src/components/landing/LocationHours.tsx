// Location + Hours section.
//
// TODO(ops): replace placeholder address, postcode, coordinates, and map
// embed URL with real values once the facility address is confirmed. The
// Google Maps iframe currently points at generic Hyderabad center — update
// the `q` param to the real address or place ID for the proper pin.
//
// SEO: semantic <address> element + NAP (Name/Address/Phone) consistency
// with the JSON-LD schema and the footer. Local SEO relies on exact-match
// NAP across all three surfaces.

const ADDRESS = {
  line1: "Pickleball Central",
  line2: "Peerzadiguda, Hyderabad",
  postcode: "500039",
  city: "Hyderabad",
};

// Google Maps Place ID coordinates for Pickleball Central, Peerzadiguda
const GEO = {
  lat: 17.391391,
  lng: 78.611158,
};

const PHONE = "+91 97007 44634";
const EMAIL = "hi@pickleball-central.co.in";

// Neighbouring localities players regularly travel from. Peerzadiguda sits
// right next to Uppal, so the facility genuinely serves these areas — this is
// an honest local-SEO signal, not keyword stuffing. Keep in sync with the
// `areaServed` list in StructuredData.tsx and the "Which areas do you serve?"
// FAQ in faq-data.ts.
const NEARBY_AREAS = "Uppal, Habsiguda, Nacharam, Boduppal & Ghatkesar";

const HOURS = [
  { day: "Monday", time: "6:00 AM – 11:00 PM" },
  { day: "Tuesday", time: "6:00 AM – 11:00 PM" },
  { day: "Wednesday", time: "6:00 AM – 11:00 PM" },
  { day: "Thursday", time: "6:00 AM – 11:00 PM" },
  { day: "Friday", time: "6:00 AM – 11:00 PM" },
  { day: "Saturday", time: "6:00 AM – 11:00 PM" },
  { day: "Sunday", time: "6:00 AM – 11:00 PM" },
];

const MAPS_LINK = `https://www.google.com/maps/dir/?api=1&destination=${17.391391},${78.611158}&destination_place_id=ChIJW8rKJbCfyzsRu4zLBYpLEoc`;

// Google Maps embed — satellite/standard view for Pickleball Central's
// real Google Business Profile. Pulled from the Maps share → embed iframe.
export const MAP_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3807.424774171967!2d78.61116377623904!3d17.39139100268769!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bcb9fb0250aca5b%3A0x87124b8a05cb8cbb!2sPickleball%20Central!5e0!3m2!1sen!2sin!4v1776284447837!5m2!1sen!2sin";

export function LocationHours() {
  return (
    <section
      id="visit"
      aria-labelledby="visit-heading"
      className="relative py-24 md:py-32 bg-[#0A0F1E]"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl mb-12">
          <span className="inline-block font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-4">
            Visit us
          </span>
          <h2
            id="visit-heading"
            className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-tight text-white"
            style={{ fontFamily: "var(--font-display)" }}
          >
            COME PLAY WITH US.
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {/* Left: details */}
          <div className="space-y-8">
            {/* Address */}
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-3">
                Address
              </h3>
              <address
                className="not-italic text-white text-lg leading-relaxed"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {ADDRESS.line1}
                <br />
                {ADDRESS.line2}
                <br />
                {ADDRESS.city} {ADDRESS.postcode}
              </address>
              <p className="mt-3 text-sm text-[#94A3B8] leading-relaxed">
                Easy to reach from {NEARBY_AREAS} — just minutes from Uppal.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-3">
                Contact
              </h3>
              <div className="space-y-2">
                <a
                  href={`tel:${PHONE.replace(/\s/g, "")}`}
                  className="block text-white hover:text-[#C8F400] transition-colors font-mono"
                >
                  {PHONE}
                </a>
                <a
                  href={`mailto:${EMAIL}`}
                  className="block text-white hover:text-[#C8F400] transition-colors font-mono break-all"
                >
                  {EMAIL}
                </a>
              </div>
            </div>

            {/* Hours */}
            <div>
              <h3 className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] mb-3">
                Opening Hours
              </h3>
              <ul className="space-y-2">
                {HOURS.map((row) => (
                  <li
                    key={row.day}
                    className="flex items-center justify-between font-mono text-sm border-b border-[#2A3548]/40 pb-2"
                  >
                    <span className="text-[#94A3B8] uppercase tracking-wider text-[11px]">
                      {row.day}
                    </span>
                    <span className="text-white">{row.time}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Directions button — deep links to Google Maps with real coordinates */}
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${GEO.lat},${GEO.lng}&destination_place_id=ChIJW8rKJbCfyzsRu4zLBYpLEoc`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#C8F400] text-[#0A0F1E] text-sm font-bold uppercase tracking-[0.1em] hover:bg-[#D8FF20] transition-all"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Get Directions
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Right: Google Maps embed */}
          <div className="relative rounded-3xl border border-[#2A3548] overflow-hidden bg-[#111827] aspect-square lg:aspect-auto lg:min-h-[480px]">
            <iframe
              src={MAP_EMBED_SRC}
              title="Pickleball Central location map"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
              allowFullScreen
            />
            {/* Floating "Open in Maps" pill for a quick click-through */}
            <a
              href={MAPS_LINK}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-4 right-4 inline-flex items-center gap-2 rounded-full border border-[#2A3548] bg-[#0A0F1E]/85 backdrop-blur-md px-4 py-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C8F400] hover:border-[#C8F400]/50 transition-colors"
            >
              Open in Maps
              <span aria-hidden>↗</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
