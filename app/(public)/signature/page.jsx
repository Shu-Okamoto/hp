import { SignaturePage } from "../../components/PublicSite";
import { getProduct } from "../../lib/products-store";

export const revalidate = 60;

export const metadata = {
  title: "大吟醸の奈良漬｜里の味みかわ",
  description:
    "里の味みかわの看板商品「大吟醸の奈良漬」。地元蔵元の大吟醸酒粕で四度漬け重ねた、贈答にも喜ばれる深いコクの一品。",
  openGraph: {
    title: "大吟醸の奈良漬｜里の味みかわ",
    description: "大吟醸酒粕で四度漬け重ねた、里の味みかわの看板商品。御中元・御歳暮・お酒の肴に。",
    type: "website",
    locale: "ja_JP",
  },
};

export default async function Page() {
  const product = await getProduct("daiginjo-narazuke");
  return <SignaturePage product={product} />;
}
