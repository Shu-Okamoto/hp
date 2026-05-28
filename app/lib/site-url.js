/**
 * Resolve the site's absolute origin (protocol + host) for use in:
 *   - app/layout.jsx → metadata.metadataBase
 *   - app/sitemap.js → URL entries (must be absolute)
 *   - app/robots.js  → sitemap field
 *
 * Tries each candidate in order and returns the first one that parses as
 * a valid URL. Invalid env values (e.g. a misconfigured "sitemap.xml" in
 * NEXT_PUBLIC_SITE_URL) get silently skipped instead of crashing the
 * entire app via `new URL("sitemap.xml")`.
 */
export function getSiteUrl() {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.NEXT_PUBLIC_VERCEL_URL && `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`,
    process.env.VERCEL_URL && `https://${process.env.VERCEL_URL}`,
    "http://localhost:3000",
  ];
  for (const c of candidates) {
    if (!c) continue;
    try {
      return new URL(c).origin;
    } catch {}
  }
  return "http://localhost:3000";
}
