const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export default function robots() {
  const base = siteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/wireframes"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
