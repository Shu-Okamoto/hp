import { ShopsPage } from "../../components/PublicSite";

export const metadata = {
  title: "店舗一覧｜里の味みかわ",
  description: "山口県岩国市内に3店舗。本社惣菜本部・西岩国店・南岩国店の営業時間・アクセス・電話番号。",
  openGraph: {
    title: "店舗一覧｜里の味みかわ",
    description: "山口県岩国市内3店舗の営業時間・アクセス案内。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <ShopsPage />;
}
