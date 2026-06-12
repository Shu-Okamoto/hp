import { BentoPage } from "../../components/PublicSite";

export const metadata = {
  title: "お弁当のご予約｜里の味みかわ",
  description:
    "ヤクルト式 お弁当便 — 岩国エリア地域密着、週替わりカタログから選べる弁当配達。地元の旬野菜を活かした栄養バランスの整ったお弁当をご自宅・職場へお届けします。",
  openGraph: {
    title: "お弁当のご予約｜里の味みかわ",
    description: "岩国エリアの週替わり弁当配達。地元野菜を活かした、八百屋ならではのお弁当をオンライン予約。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <BentoPage />;
}
