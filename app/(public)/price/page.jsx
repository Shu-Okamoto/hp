import { PricePage } from "../../components/PublicSite";
import { getPrices } from "../../lib/prices-store";

// ISR — revalidate every 30 seconds so admin edits propagate quickly
// without each request hitting KV.
export const revalidate = 30;

export const metadata = {
  title: "今日の販売価格｜里の味みかわ",
  description: "毎朝、店頭の値段をそのままお届け。本日の野菜・農産物の価格一覧。",
  openGraph: {
    title: "今日の販売価格｜里の味みかわ",
    description: "毎朝更新、本日の野菜・農産物の店頭価格。",
    type: "website",
    locale: "ja_JP",
  },
};

export default async function Page() {
  const prices = await getPrices();
  return <PricePage prices={prices} />;
}
