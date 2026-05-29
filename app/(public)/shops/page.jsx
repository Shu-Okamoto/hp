import { ShopsPage } from "../../components/PublicSite";

export const metadata = {
  title: "店舗一覧｜里の味みかわ",
  description: "山口県岩国市で2店舗の八百屋を運営しております。里の味みかわ西岩国店・里の味南岩国店・みかわ本社惣菜本部の営業時間・アクセス・電話番号。",
  openGraph: {
    title: "店舗一覧｜里の味みかわ",
    description: "山口県岩国市で2店舗の八百屋を運営。各店舗の営業時間・アクセス案内。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <ShopsPage />;
}
