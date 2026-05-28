import { HomePage } from "../components/PublicSite";
import { getPrices } from "../lib/prices-store";
import { getPosts } from "../lib/posts-store";
import { getProducts } from "../lib/products-store";

// Revalidate every 30 seconds so admin edits propagate quickly to the
// homepage Stories / ProductGrid / NewsList sections.
export const revalidate = 30;

export const metadata = {
  title: "里の味みかわ — 農家と共に、畑から食卓へ",
  description:
    "岩国の畑から、毎日の食卓へ。今日の販売価格・新鮮な野菜・お弁当・加工品を、農家直送でお届けします。",
  openGraph: {
    title: "里の味みかわ",
    description: "農家と共に、畑から食卓へ。岩国の八百屋が届ける、新しい食のかたち。",
    type: "website",
    locale: "ja_JP",
  },
};

export default async function Page() {
  // Fetch in parallel — each store has its own seed fallback when
  // Supabase isn't configured, so the page renders cleanly even on
  // unprovisioned previews.
  const [prices, posts, products] = await Promise.all([
    getPrices(),
    getPosts(),
    getProducts(),
  ]);
  return <HomePage prices={prices} posts={posts} products={products} />;
}
