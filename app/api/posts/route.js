import { auth } from "../../../auth";
import { getPosts, createPost } from "../../lib/posts-store";
import { serviceClient } from "../../lib/supabase";
import { broadcast, isLineConfigured } from "../../lib/line";

/**
 * Posts (お知らせ) API.
 *
 * GET    → public list, archived rows hidden by RLS
 * POST   → admin-only. Accepts multipart/form-data:
 *            title, body, emoji, source, channels (CSV), igHandle,
 *            image (file, optional)
 *          Pipeline:
 *            1) If image present → upload to Storage bucket `post-images`
 *               via service role → resolve public URL.
 *            2) Insert row into hp.posts (image_url, channels, ...).
 *            3) If "line" ∈ channels && LINE configured → broadcast
 *               (text = title + body, image attached when present).
 *          Response carries the inserted row + a per-channel status
 *          map so the admin UI can show what actually went out.
 */

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = await getPosts();
  return Response.json(posts, {
    headers: { "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "expected multipart/form-data" }, { status: 400 });
  }

  const title = (form.get("title") || "").toString().trim();
  if (!title) return Response.json({ error: "title required" }, { status: 400 });
  const body = (form.get("body") || "").toString();
  const emoji = (form.get("emoji") || "📣").toString();
  const source = (form.get("source") || "news").toString();
  const igHandle = (form.get("igHandle") || "").toString().trim() || null;
  const channelsCsv = (form.get("channels") || "web").toString();
  const channels = channelsCsv.split(",").map((c) => c.trim()).filter(Boolean);

  // ── 1. Optional image upload ───────────────────────────────────────
  let imageUrl = null;
  const file = form.get("image");
  if (file && typeof file === "object" && file.size > 0) {
    const supabase = serviceClient();
    if (!supabase) {
      return Response.json({
        error: "Supabase not configured (image upload requires SUPABASE_SERVICE_ROLE_KEY)",
      }, { status: 503 });
    }
    const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
    const path = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    const up = await supabase.storage.from("post-images").upload(path, buf, {
      contentType: file.type || "image/jpeg",
      cacheControl: "31536000",
      upsert: false,
    });
    if (up.error) {
      return Response.json({ error: `image upload failed: ${up.error.message}` }, { status: 502 });
    }
    const { data: pub } = supabase.storage.from("post-images").getPublicUrl(path);
    imageUrl = pub?.publicUrl || null;
  }

  // ── 2. Insert row ──────────────────────────────────────────────────
  let post;
  try {
    post = await createPost({
      title, body, emoji, source, igHandle, channels, imageUrl,
    });
  } catch (e) {
    if (e.code === "SUPABASE_NOT_CONFIGURED") {
      return Response.json({
        error: "Supabase not configured",
        hint: "NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定し、001/002 マイグレーションを実行してください。",
      }, { status: 503 });
    }
    return Response.json({ error: e.message }, { status: 500 });
  }

  // ── 3. Fan out to LINE if requested ────────────────────────────────
  const fanout = {};
  if (channels.includes("line")) {
    if (!isLineConfigured()) {
      fanout.line = { ok: false, reason: "LINE_CHANNEL_ACCESS_TOKEN not set" };
    } else {
      const text = body ? `${title}\n\n${body}` : title;
      const r = await broadcast({ text, imageUrl });
      fanout.line = r.ok ? { ok: true } : { ok: false, status: r.status, body: r.body };
    }
  }
  if (channels.includes("ig")) {
    // Instagram Graph API publishing requires app review + complex flow.
    // For now we just record the intent — admin should publish manually.
    fanout.ig = { ok: false, reason: "Instagram 投稿は未実装 (手動投稿してください)" };
  }
  if (channels.includes("web")) {
    fanout.web = { ok: true };
  }

  return Response.json({ post, fanout });
}
