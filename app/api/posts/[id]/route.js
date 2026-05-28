import { auth } from "../../../../auth";
import { archivePost, deletePost, getPost } from "../../../lib/posts-store";

export const dynamic = "force-dynamic";

export async function GET(_req, { params }) {
  const post = await getPost(params.id);
  if (!post) return Response.json({ error: "not found" }, { status: 404 });
  return Response.json(post);
}

export async function PATCH(req, { params }) {
  const session = await auth();
  if (!session?.user) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body) return Response.json({ error: "json body required" }, { status: 400 });
  if (typeof body.archived !== "boolean") {
    return Response.json({ error: "only archived patch supported" }, { status: 400 });
  }
  try {
    await archivePost(params.id, body.archived);
    return Response.json({ ok: true });
  } catch (e) {
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({ error: "Supabase not configured" }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (session?.user?.role !== "owner") {
    return Response.json({ error: "owner only" }, { status: 403 });
  }
  try {
    await deletePost(params.id);
    return new Response(null, { status: 204 });
  } catch (e) {
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({ error: "Supabase not configured" }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }
}
