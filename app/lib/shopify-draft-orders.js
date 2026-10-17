import "server-only";
import { serviceClient } from "./supabase";
import { shopifyDomain } from "./shopify-sync";

/**
 * Shopify 下書き注文 (Draft Order) 作成。
 *
 * 贈答用の注文を、スタッフが管理画面から 1 件ずつ Shopify の下書き
 * 注文として起票する。決済・在庫引当はせず、Shopify 管理画面で
 * スタッフが内容確認 → 請求書送付 or 店頭会計、という運用を想定。
 *
 * - variant_id が分かっていれば実商品行、無ければ custom line item
 *   (title + price) で代用するので、Shopify 未同期のローカル専用
 *   商品でも下書き注文は作成できる。
 * - billing_address = 送り主、shipping_address = 送り先、という
 *   贈答特有の割り当て。
 *
 * Env:
 *   SHOPIFY_STORE_DOMAIN  e.g. mikawa2020.myshopify.com
 *   SHOPIFY_ADMIN_TOKEN   write-capable Admin API token
 *                         (必要スコープ: write_draft_orders)
 */

const API_VERSION = "2025-01";

export function isShopifyAdminConfigured() {
  return !!(process.env.SHOPIFY_STORE_DOMAIN && process.env.SHOPIFY_ADMIN_TOKEN);
}

function splitName(fullName) {
  const s = (fullName || "").trim();
  if (!s) return { first_name: "", last_name: "" };
  // 日本語の氏名はスペース区切りの慣習が薄いので、素直に空白があれば
  // 分割、無ければ全体を last_name (姓) 扱いにして Shopify の必須
  // フィールドを満たす。
  const parts = s.split(/\s+/);
  if (parts.length >= 2) {
    return { first_name: parts.slice(1).join(" "), last_name: parts[0] };
  }
  return { first_name: "", last_name: s };
}

/**
 * @param {object} opts
 * @param {{handle:string,title:string,priceJpy:number,variantId?:string}} opts.product
 * @param {{name:string,phone?:string,email?:string}} opts.sender
 * @param {{name:string,zip?:string,pref?:string,city?:string,address1?:string,address2?:string,phone?:string,quantity:number,note?:string}} opts.recipient
 * @returns {Promise<{ok:true,id:string,name:string,url:string}|{ok:false,error:string}>}
 */
export async function createGiftDraftOrder({ product, sender, recipient }) {
  if (!isShopifyAdminConfigured()) {
    return { ok: false, error: "Shopify Admin API が設定されていません (SHOPIFY_STORE_DOMAIN / SHOPIFY_ADMIN_TOKEN)。" };
  }
  const domain = shopifyDomain();
  const qty = Math.max(1, Number(recipient.quantity) || 1);

  const lineItem = product.variantId
    ? { variant_id: Number(product.variantId), quantity: qty }
    : { title: product.title, price: String(product.priceJpy), quantity: qty, requires_shipping: true, taxable: true };

  const recipientName = splitName(recipient.name);
  const senderName = splitName(sender.name);

  const payload = {
    draft_order: {
      line_items: [lineItem],
      shipping_address: {
        first_name: recipientName.first_name,
        last_name: recipientName.last_name,
        address1: recipient.address1 || "",
        address2: recipient.address2 || "",
        city: recipient.city || "",
        province: recipient.pref || "",
        zip: recipient.zip || "",
        phone: recipient.phone || "",
        country: "Japan",
      },
      billing_address: {
        first_name: senderName.first_name,
        last_name: senderName.last_name,
        phone: sender.phone || "",
        country: "Japan",
      },
      email: sender.email || undefined,
      note: [
        `【贈答注文】里の味みかわ HP 管理画面より`,
        `送り主: ${sender.name}${sender.phone ? ` (${sender.phone})` : ""}${sender.email ? ` <${sender.email}>` : ""}`,
        `送り先: ${recipient.name}`,
        recipient.note ? `備考: ${recipient.note}` : null,
      ].filter(Boolean).join("\n"),
      tags: "里の味HP,贈答注文",
      use_customer_default_address: false,
    },
  };

  let res;
  try {
    res = await fetch(`https://${domain}/admin/api/${API_VERSION}/draft_orders.json`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": (process.env.SHOPIFY_ADMIN_TOKEN || "").trim(),
      },
      body: JSON.stringify(payload),
      cache: "no-store",
    });
  } catch (e) {
    const cause = e.cause?.code || e.cause?.message || e.message;
    return { ok: false, error: `Shopify へ接続できません (${domain}): ${cause}` };
  }

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    if (res.status === 401 || res.status === 403) {
      return { ok: false, error: "Shopify Admin トークンが無効、または write_draft_orders 権限がありません。" };
    }
    return { ok: false, error: `Shopify Admin ${res.status}: ${body.slice(0, 300)}` };
  }

  const json = await res.json();
  const draft = json.draft_order;
  if (!draft) {
    return { ok: false, error: "Shopify から予期しない応答がありました。" };
  }
  return {
    ok: true,
    id: String(draft.id),
    name: draft.name,
    url: `https://${domain}/admin/draft_orders/${draft.id}`,
  };
}
