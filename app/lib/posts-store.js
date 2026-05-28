import "server-only";
import { serviceClient, anonClient } from "./supabase";
import { seed } from "./seed";

/**
 * Server-side news/post store backed by `hp.posts`.
 *
 * Reads via anon (RLS allows non-archived rows only). Writes via
 * service role from API routes after Auth.js has gated the request.
 */

const TABLE = "posts";

function fromDb(r) {
  return {
    id: r.id,
    date: r.date,
    source: r.source,
    title: r.title,
    body: r.body || "",
    emoji: r.emoji || "📣",
    igHandle: r.ig_handle || undefined,
    imageUrl: r.image_url || undefined,
    channels: r.channels || ["web"],
    archived: r.archived,
  };
}

function toDb(p) {
  return {
    id: p.id,
    date: p.date,
    source: p.source ?? "news",
    title: p.title,
    body: p.body ?? "",
    emoji: p.emoji ?? "📣",
    ig_handle: p.igHandle ?? null,
    image_url: p.imageUrl ?? null,
    channels: p.channels ?? ["web"],
    archived: !!p.archived,
  };
}

/** Public read — newest first, archived excluded by RLS. */
export async function getPosts({ includeArchived = false } = {}) {
  const supabase = anonClient() || serviceClient();
  if (!supabase) return seed().posts;
  let q = supabase.from(TABLE).select("*").order("date", { ascending: false });
  if (includeArchived) {
    // override RLS read filter — only works through service role
    if (!serviceClient()) return seed().posts;
    q = serviceClient().from(TABLE).select("*").order("date", { ascending: false });
  }
  const { data, error } = await q;
  if (error) {
    console.error("[posts-store] select failed:", error);
    return seed().posts;
  }
  if (!data || data.length === 0) return seed().posts;
  return data.map(fromDb);
}

export async function getPost(id) {
  const supabase = anonClient() || serviceClient();
  if (!supabase) return seed().posts.find((p) => p.id === id) || null;
  const { data, error } = await supabase.from(TABLE).select("*").eq("id", id).maybeSingle();
  if (error) {
    console.error("[posts-store] select one failed:", error);
    return seed().posts.find((p) => p.id === id) || null;
  }
  return data ? fromDb(data) : null;
}

export async function createPost(post) {
  const supabase = serviceClient();
  if (!supabase) {
    const e = new Error("SUPABASE_NOT_CONFIGURED");
    e.code = "SUPABASE_NOT_CONFIGURED";
    throw e;
  }
  const id = post.id || `n-${Date.now().toString(36)}`;
  const row = toDb({ ...post, id, date: post.date || new Date().toISOString().slice(0, 10) });
  const { data, error } = await supabase.from(TABLE).insert(row).select("*").maybeSingle();
  if (error) throw error;
  return data ? fromDb(data) : null;
}

export async function archivePost(id, archived = true) {
  const supabase = serviceClient();
  if (!supabase) {
    const e = new Error("SUPABASE_NOT_CONFIGURED");
    e.code = "SUPABASE_NOT_CONFIGURED";
    throw e;
  }
  const { error } = await supabase.from(TABLE).update({ archived }).eq("id", id);
  if (error) throw error;
}

export async function deletePost(id) {
  const supabase = serviceClient();
  if (!supabase) {
    const e = new Error("SUPABASE_NOT_CONFIGURED");
    e.code = "SUPABASE_NOT_CONFIGURED";
    throw e;
  }
  const { error } = await supabase.from(TABLE).delete().eq("id", id);
  if (error) throw error;
}
