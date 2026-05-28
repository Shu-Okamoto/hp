import { getSiteUrl } from "./lib/site-url";
import { getProducts } from "./lib/products-store";
import { getPosts } from "./lib/posts-store";

export default async function sitemap() {
  const base = getSiteUrl();
  const today = new Date();
  const [products, posts] = await Promise.all([getProducts(), getPosts()]);

  const staticRoutes = ["", "/products", "/news", "/price", "/shops", "/agri"].map((p) => ({
    url: `${base}${p}`,
    lastModified: today,
    changeFrequency: p === "/price" ? "daily" : "weekly",
    priority: p === "" ? 1 : 0.7,
  }));
  const productEntries = products.map((p) => ({
    url: `${base}/products/${p.handle}`,
    lastModified: today,
    changeFrequency: "weekly",
    priority: 0.6,
  }));
  const postEntries = posts.map((p) => ({
    url: `${base}/news/${p.id}`,
    lastModified: p.date ? new Date(p.date) : today,
    changeFrequency: "monthly",
    priority: 0.4,
  }));
  return [...staticRoutes, ...productEntries, ...postEntries];
}
