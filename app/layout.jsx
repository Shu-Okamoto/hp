import "./globals.css";
import "./public-site.css";
import "./admin.css";

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
  "http://localhost:3000";

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "さとの味みかわ — 農家と共に、畑から食卓へ",
    template: "%s",
  },
  description: "愛知の畑から、毎日の食卓へ。今日の販売価格・新鮮な野菜・お弁当・加工品を、農家直送でお届けします。",
  applicationName: "さとの味みかわ",
  authors: [{ name: "株式会社さとの味みかわ" }],
  keywords: ["八百屋", "愛知", "三河", "農家直送", "野菜", "弁当", "今日の価格", "アグリパートナーズ"],
  openGraph: {
    siteName: "さとの味みかわ",
    type: "website",
    locale: "ja_JP",
  },
  twitter: {
    card: "summary_large_image",
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2d5a3d",
};

const FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Noto+Sans+JP:wght@400;500;600;700&family=Shippori+Mincho:wght@400;500;600&display=swap";

export default function RootLayout({ children }) {
  return (
    <html lang="ja">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href={FONTS_HREF} rel="stylesheet" />
      </head>
      <body>
        <div id="root">{children}</div>
      </body>
    </html>
  );
}
