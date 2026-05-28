import { seed } from "./lib/seed";
import { getSiteUrl } from "./lib/site-url";

export default function sitemap() {
  const base = getSiteUrl();
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
