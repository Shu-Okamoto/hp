import { HomePage } from "../components/PublicSite";

export const metadata = {
  title: "さとの味みかわ — 農家と共に、畑から食卓へ",
  description:
    "愛知の畑から、毎日の食卓へ。今日の販売価格・新鮮な野菜・お弁当・加工品を、農家直送でお届けします。",
  openGraph: {
    title: "さとの味みかわ",
    description: "農家と共に、畑から食卓へ。愛知の八百屋が届ける、新しい食のかたち。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <HomePage />;
}
