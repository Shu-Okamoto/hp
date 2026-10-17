import "server-only";
import { serviceClient } from "./supabase";

/**
 * hp.draft_orders のログ読み書き。service_role 専用 (管理画面内部用、
 * 公開読み取りなし)。
 */

const TABLE = "draft_orders";

function fromDb(r) {
  return {
    id: r.id,
    batchId: r.batch_id,
    createdAt: r.created_at,
    createdBy: r.created_by,
    productHandle: r.product_handle,
    productTitle: r.product_title,
    priceJpy: r.price_jpy,
    variantId: r.variant_id || undefined,
    quantity: r.quantity,
    senderName: r.sender_name,
    senderPhone: r.sender_phone,
    senderEmail: r.sender_email,
    recipientName: r.recipient_name,
    recipientZip: r.recipient_zip,
    recipientPref: r.recipient_pref,
    recipientCity: r.recipient_city,
    recipientAddress1: r.recipient_address1,
    recipientAddress2: r.recipient_address2,
    recipientPhone: r.recipient_phone,
    note: r.note,
    status: r.status,
    shopifyDraftOrderId: r.shopify_draft_order_id || undefined,
    shopifyDraftOrderName: r.shopify_draft_order_name || undefined,
    shopifyDraftOrderUrl: r.shopify_draft_order_url || undefined,
    errorMessage: r.error_message || undefined,
    syncedAt: r.synced_at || undefined,
  };
}

export async function logDraftOrderRow(row) {
  const supabase = serviceClient();
  if (!supabase) return; // ログ保存は best-effort。失敗しても注文処理自体は止めない。
  const { error } = await supabase.from(TABLE).insert({
    id: row.id,
    batch_id: row.batchId,
    created_by: row.createdBy || null,
    product_handle: row.productHandle,
    product_title: row.productTitle,
    price_jpy: row.priceJpy,
    variant_id: row.variantId || null,
    quantity: row.quantity,
    sender_name: row.senderName,
    sender_phone: row.senderPhone || null,
    sender_email: row.senderEmail || null,
    recipient_name: row.recipientName,
    recipient_zip: row.recipientZip || null,
    recipient_pref: row.recipientPref || null,
    recipient_city: row.recipientCity || null,
    recipient_address1: row.recipientAddress1 || null,
    recipient_address2: row.recipientAddress2 || null,
    recipient_phone: row.recipientPhone || null,
    note: row.note || null,
    status: row.status,
    shopify_draft_order_id: row.shopifyDraftOrderId || null,
    shopify_draft_order_name: row.shopifyDraftOrderName || null,
    shopify_draft_order_url: row.shopifyDraftOrderUrl || null,
    error_message: row.errorMessage || null,
    synced_at: row.status === "success" ? new Date().toISOString() : null,
  });
  if (error) console.error("[draft-orders-store] insert failed:", error);
}

export async function listDraftOrders({ limit = 50 } = {}) {
  const supabase = serviceClient();
  if (!supabase) return [];
  const { data, error } = await supabase
    .from(TABLE)
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("[draft-orders-store] select failed:", error);
    return [];
  }
  return (data || []).map(fromDb);
}
