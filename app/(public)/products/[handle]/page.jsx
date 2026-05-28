import { notFound } from "next/navigation";
import { ProductDetailPage } from "../../../components/PublicSite";
import { getProduct, getProducts } from "../../../lib/products-store";

export const revalidate = 60;
export const dynamicParams = true;

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((p) => ({ handle: p.handle }));
}

export async function generateMetadata({ params }) {
  const product = await getProduct(params.handle);
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
  const product = await getProduct(params.handle);
  if (!product) notFound();
  const products = await getProducts();
  const related = products.filter((p) => p.id !== product.id).slice(0, 3);
  return <ProductDetailPage product={product} related={related} />;
}
