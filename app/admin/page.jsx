import AdminApp from "../components/AdminApp";

export const metadata = {
  title: "管理画面｜さとの味みかわ",
  description: "管理者用コンソール",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <AdminApp />;
}
