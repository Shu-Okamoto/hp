import { auth } from "../../../../../auth";

const API_VERSION = "2025-01";

function jerror(status, message, details) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status });
}

export async function DELETE(_req, { params }) {
  const session = await auth();
  if (session?.user?.role !== "owner") {
    return jerror(403, "オーナーのみ商品を変更できます");
  }
  const missing = ["SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_TOKEN"].filter((k) => !process.env[k]);
  if (missing.length) return jerror(503, "Shopify Admin env not configured", { missing });

  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/products/${encodeURIComponent(params.id)}.json`,
    {
      method: "DELETE",
      headers: { "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN },
    }
  );
  if (!res.ok) return jerror(502, `Shopify Admin ${res.status}`, await res.text());
  return new Response(null, { status: 204 });
}
