import { auth } from "../../../../auth";
import { serviceClient } from "../../../lib/supabase";

/**
 * Product image upload.
 *
 * POST multipart/form-data with `image` field. Returns { url } — a
 * public URL from the Storage bucket `product-images`. The admin
 * ProductManager pastes that URL into the working copy's image_url,
 * which then persists via the standard products PUT.
 *
 * Requires an Auth.js session (any role).
 */

export const dynamic = "force-dynamic";

export async function POST(req) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const supabase = serviceClient();
  if (!supabase) {
    return Response.json({
      error: "Supabase not configured",
      hint: "SUPABASE_SERVICE_ROLE_KEY を設定してください。",
    }, { status: 503 });
  }

  let form;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ error: "expected multipart/form-data" }, { status: 400 });
  }
  const file = form.get("image");
  if (!file || typeof file !== "object" || file.size === 0) {
    return Response.json({ error: "image file required" }, { status: 400 });
  }
  // Basic size guard — 8MB should cover product photos comfortably.
  if (file.size > 8 * 1024 * 1024) {
    return Response.json({ error: "image too large (max 8MB)" }, { status: 413 });
  }

  const ext = (file.name?.split(".").pop() || "jpg").toLowerCase().replace(/[^a-z0-9]/g, "") || "jpg";
  const path = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const buf = Buffer.from(await file.arrayBuffer());
  const up = await supabase.storage.from("product-images").upload(path, buf, {
    contentType: file.type || "image/jpeg",
    cacheControl: "31536000",
    upsert: false,
  });
  if (up.error) {
    return Response.json({ error: `upload failed: ${up.error.message}` }, { status: 502 });
  }
  const { data: pub } = supabase.storage.from("product-images").getPublicUrl(path);
  return Response.json({ url: pub?.publicUrl || null });
}
