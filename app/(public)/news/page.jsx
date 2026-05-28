import { NewsPage } from "../../components/PublicSite";

export const metadata = {
  title: "お知らせ｜里の味みかわ",
  description: "店舗の入荷情報、イベント、SNS の最新投稿。里の味みかわのお知らせ一覧。",
  openGraph: {
    title: "お知らせ｜里の味みかわ",
    description: "店舗の入荷情報、イベント、SNS の最新投稿。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <NewsPage />;
}
