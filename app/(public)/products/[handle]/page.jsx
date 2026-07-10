import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../components/PublicSite";
import { getProduct, getProducts } from "../../../lib/products-store";

export const revalidate = 60;
export const dynamicParams = true;

// Next.js App Router passes dynamic params percent-encoded. Shopify で
// 日本語タイトルから自動生成された handle は日本語文字を含むため、
// デコードしないと DB の handle と一致せず 404 になる (英字 handle の
// 商品だけ動く、という症状の原因)。
function decodeHandle(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw; // 不正なエンコーディングはそのまま照合に回す
  }
}

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }) {
  const product = await getProduct(decodeHandle(params.handle));
  if (!product) return { title: "商品が見つかりません｜里の味みかわ" };
  const title = `${product.title}｜里の味みかわ`;
  return {
    title,
    description: product.desc,
    openGraph: {
      title,
      description: product.desc,
      type: "website",
      locale: "ja_JP",
      ...(product.imageUrl ? { images: [product.imageUrl] } : {}),
    },
  };
}

export default async function Page({ params }) {
  const handle = decodeHandle(params.handle);
  const product = await getProduct(handle);
  if (!product) notFound();
  const products = await getProducts();
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  return <ProductDetailPage product={product} related={related} />;
}
