import "./globals.css";
import "./public-site.css";
import "./admin.css";

export const metadata = {
  title: "さとの味みかわ — 実装プロトタイプ",
  description: "農家と共に、畑から食卓へ。",
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
