import { AgriPage } from "../../components/PublicSite";

export const metadata = {
  title: "農家との取り組み｜さとの味みかわ",
  description: "協同組合いわくにアグリパートナーズと共に、規格外野菜を活かす商品開発・販路拡大に取り組んでいます。",
  openGraph: {
    title: "農家との取り組み｜さとの味みかわ",
    description: "農家と共に、地域の畑をつなぐ。アグリパートナーズとの取り組み紹介。",
    type: "website",
    locale: "ja_JP",
  },
};

export default function Page() {
  return <AgriPage />;
}
