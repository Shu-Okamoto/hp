import { ProductsPage } from "../../components/PublicSite";

export const metadata = {
  title: "商品・メニュー｜さとの味みかわ",
  description: "農家直送の旬野菜・加工品・お弁当まで、さとの味みかわが取り扱う商品一覧。",
  openGraph: {
    title: "商品・メニュー｜さとの味みかわ",
    description: "農家直送の旬野菜・加工品・お弁当まで、さとの味みかわが取り扱う商品一覧。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <ProductsPage />;
}
