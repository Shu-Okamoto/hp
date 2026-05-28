import { getSiteUrl } from "./lib/site-url";

export default function robots() {
  const base = getSiteUrl();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api", "/wireframes"] },
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
