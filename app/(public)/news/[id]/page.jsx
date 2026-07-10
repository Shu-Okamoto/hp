import { notFound } from "next/navigation";
import { NewsDetailPage } from "../../../components/PublicSite";
import { getPost, getPosts } from "../../../lib/posts-store";

export const revalidate = 60;
export const dynamicParams = true;

// Params arrive percent-encoded from the App Router — decode before the
// DB lookup so non-ASCII ids resolve (same fix as products/[handle]).
function decodeId(raw) {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

export async function generateStaticParams() {
  const posts = await getPosts();
  return posts.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }) {
  const post = await getPost(decodeId(params.id));
  if (!post) return { title: "お知らせが見つかりません｜里の味みかわ" };
  const title = `${post.title}｜里の味みかわ`;
  return {
    title,
    description: post.body?.slice(0, 120) ?? "",
    openGraph: {
      title,
      description: post.body?.slice(0, 120) ?? "",
      type: "article",
      locale: "ja_JP",
      publishedTime: post.date,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    },
  };
}

export default async function Page({ params }) {
  const post = await getPost(decodeId(params.id));
  if (!post) notFound();
  const posts = await getPosts();
  return <NewsDetailPage post={post} related={posts.filter((p) => p.id !== post.id).slice(0, 4)} />;
}
