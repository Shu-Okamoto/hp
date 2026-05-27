import { notFound } from "next/navigation";
import { NewsDetailPage } from "../../../components/PublicSite";
import { seed } from "../../../lib/seed";

export const dynamicParams = true;

export function generateStaticParams() {
  return seed().posts.map((p) => ({ id: p.id }));
}

export function generateMetadata({ params }) {
  const post = seed().posts.find((p) => p.id === params.id);
  if (!post) {
    return { title: "お知らせが見つかりません｜さとの味みかわ" };
  }
  const title = `${post.title}｜さとの味みかわ`;
  return {
    title,
    description: post.body?.slice(0, 120) ?? "",
    openGraph: {
      title,
      description: post.body?.slice(0, 120) ?? "",
      type: "article",
      locale: "ja_JP",
      publishedTime: post.date,
    },
  };
}

export default function Page({ params }) {
  const post = seed().posts.find((p) => p.id === params.id);
  if (!post) notFound();
  return <NewsDetailPage id={params.id} />;
}
