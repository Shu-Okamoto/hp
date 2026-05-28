import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../components/PublicSite";
import { seed } from "../../../lib/seed";

/**
 * Product detail route.
 *
 * `generateStaticParams` pre-renders one path per seeded product so Vercel
 * statically serves them at deploy time. `generateMetadata` reads from the
 * same seed so the OGP tags reflect the actual product even before client
 * hydration — important for shareable URLs and SEO crawlers.
 *
 * When real Shopify is wired up, swap the seed lookup for a server-side
 * Storefront API fetch.
 */
export const dynamicParams = true;

export function generateStaticParams() {
  return seed().products.map((p) => ({ handle: p.handle }));
}

export function generateMetadata({ params }) {
  const product = seed().products.find((p) => p.handle === params.handle);
  if (!product) {
    return { title: "商品が見つかりません｜里の味みかわ" };
  }
  const title = `${product.title}｜里の味みかわ`;
  const description = product.desc;
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "ja_JP",
    },
  };
}

export default function Page({ params }) {
  const product = seed().products.find((p) => p.handle === params.handle);
  if (!product) notFound();
  return <ProductDetailPage handle={params.handle} />;
}
