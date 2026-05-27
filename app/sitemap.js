import { seed } from "./lib/seed";

const siteUrl = () =>
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export default function sitemap() {
  const base = siteUrl();
  const today = new Date();
  const s = seed();
  const staticRoutes = ["", "/products", "/news", "/price", "/shops", "/agri"].map((p) => ({
    url: `${base}${p}`,
    lastModified: today,
    changeFrequency: p === "/price" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
  const products = s.products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const posts = s.posts.map((p) => ({
    url: `${base}/news/${p.id}`,
    lastModified: p.date ? new Date(p.date) : today,
    changeFrequency: "monthly",
    priority: 0.4,
  }));
  return [...staticRoutes, ...products, ...posts];
}
