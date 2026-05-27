import { PricePage } from "../../components/PublicSite";

export const metadata = {
  title: "今日の販売価格｜さとの味みかわ",
  description: "毎朝、店頭の値段をそのままお届け。本日の野菜・農産物の価格一覧。",
  openGraph: {
    title: "今日の販売価格｜さとの味みかわ",
    description: "毎朝更新、本日の野菜・農産物の店頭価格。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <PricePage />;
}
