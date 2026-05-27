import { ShopsPage } from "../../components/PublicSite";

export const metadata = {
  title: "店舗一覧｜さとの味みかわ",
  description: "愛知県内に3店舗。本店・西尾店・豊田店の営業時間・アクセス・電話番号。",
  openGraph: {
    title: "店舗一覧｜さとの味みかわ",
    description: "愛知県内3店舗の営業時間・アクセス案内。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <ShopsPage />;
}
