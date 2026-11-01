/**
 * Cloudflare image-resize loader.
 *
 * When CF Image Resizing is enabled at the zone level, this rewrites
 * `/path/to/image.jpg?w=800&q=80` into
 * `https://<host>/cdn-cgi/image/width=800,quality=80,format=auto/<origin>`.
 * That feature is a paid CF add-on (Pro tier or Image Resizing
 * subscription) — when it's NOT provisioned the `/cdn-cgi/image/*`
 * URLs return 404 and every image on the site breaks.
 *
 * Behaviour:
 *   - dev (no https base url)             → return src as-is
 *   - CF_IMAGE_RESIZING enabled at runtime → rewrite to /cdn-cgi/image/...
 *   - default in prod                      → return src as-is, browser
 *     fetches the original asset (no resize, but it renders)
 *
 * Set NEXT_PUBLIC_CF_IMAGE_RESIZING=true in env once the zone has
 * Image Resizing enabled to opt back into the rewrite.
 *
 * Docs: docs/15-frontend-stack.md § 15.3 / 15.5.
 */
type LoaderArgs = {
  src: string;
  width: number;
  quality?: number;
};

export default function cfImageLoader({ src, width, quality }: LoaderArgs): string {
  const baseUrl = process.env.NEXT_PUBLIC_PUBLIC_BASE_URL ?? "";
  const rewriteEnabled = process.env.NEXT_PUBLIC_CF_IMAGE_RESIZING === "true";

  // Dev (no https base) — always pass through.
  if (!baseUrl.startsWith("https://")) {
    return src;
  }

  // Prod default — pass through. Only rewrite when explicitly opted-in
  // (the zone has CF Image Resizing provisioned and billed).
  if (!rewriteEnabled) {
    return src;
  }

  const q = quality ?? 75;
  const params = `width=${width},quality=${q},format=auto`;
  return `${baseUrl}/cdn-cgi/image/${params}/${src.startsWith("/") ? src.slice(1) : src}`;
}
