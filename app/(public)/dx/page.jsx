import { DXPage } from "../../components/PublicSite";

export const metadata = {
  title: "里の味みかわ の DX｜八百屋がつくる、地域 DX",
  description:
    "里の味みかわが進める DX の取り組み。リアルタイム価格配信、弁当オンライン予約、いわくにアグリパートナーズとの連携、統合データ基盤、統合管理コンソール。",
  openGraph: {
    title: "里の味みかわ の DX｜八百屋がつくる、地域 DX",
    description: "百年続く商いを、デジタルで次の世代へ。お客様・農家・地域をつなぐみかわの DX 取り組み。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <DXPage />;
}
