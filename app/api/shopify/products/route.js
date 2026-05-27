import { auth } from "../../../../auth";

/**
 * Shopify products — server-side proxy.
 *
 * The client adapter at `app/lib/api/adapters/shopify-real.js` fetches this
 * route when `NEXT_PUBLIC_API_MODE=real`. We keep secrets here, never in
 * the client bundle.
 *
 * Env vars (set in Vercel → Project Settings → Environment Variables):
 *   SHOPIFY_STORE_DOMAIN     e.g. mikawa.myshopify.com
 *   SHOPIFY_STOREFRONT_TOKEN read-only token (used by GET)
 *   SHOPIFY_ADMIN_TOKEN      write-capable token (used by POST/DELETE)
 *
 * If any required var is missing the handler responds 503 with a hint
 * — the client adapter surfaces the error and the prototype falls back
 * to localStorage when MODE=mock.
 */

const API_VERSION = "2025-01";

function missing(...keys) {
  return keys.filter((k) => !process.env[k]);
}

function jerror(status, message, details) {
  return Response.json({ error: message, ...(details ? { details } : {}) }, { status });
}

const PRODUCT_LIST_QUERY = `
  query Products {
    products(first: 50) {
      edges {
        node {
          id
          handle
          title
          description
          vendor
          productType
          featuredImage { url altText }
          priceRange { minVariantPrice { amount currencyCode } }
        }
      }
    }
  }
`;

function toLocalShape(node) {
  return {
    id: node.handle,
    handle: node.handle,
    title: node.title,
    priceJpy: Math.round(parseFloat(node.priceRange?.minVariantPrice?.amount ?? "0")),
    unit: node.productType ? `/ ${node.productType}` : "",
    category: node.vendor || "",
    desc: node.description || "",
    imgTone: "",
    imageUrl: node.featuredImage?.url || null,
  };
}

export async function GET() {
  const missingKeys = missing("SHOPIFY_STORE_DOMAIN", "SHOPIFY_STOREFRONT_TOKEN");
  if (missingKeys.length) {
    return jerror(503, "Shopify env not configured", { missing: missingKeys });
  }
  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/api/${API_VERSION}/graphql.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Storefront-Access-Token": process.env.SHOPIFY_STOREFRONT_TOKEN,
      },
      body: JSON.stringify({ query: PRODUCT_LIST_QUERY }),
      next: { revalidate: 60 },
    }
  );
  if (!res.ok) {
    return jerror(502, `Shopify Storefront ${res.status}`, await res.text());
  }
  const json = await res.json();
  if (json.errors) return jerror(502, "Shopify GraphQL error", json.errors);
  const products = json.data?.products?.edges?.map((e) => toLocalShape(e.node)) || [];
  return Response.json(products);
}

export async function POST(req) {
  const session = await auth();
  if (session?.user?.role !== "owner") {
    return jerror(403, "オーナーのみ商品を変更できます");
  }
  const missingKeys = missing("SHOPIFY_STORE_DOMAIN", "SHOPIFY_ADMIN_TOKEN");
  if (missingKeys.length) {
    return jerror(503, "Shopify Admin env not configured", { missing: missingKeys });
  }
  const body = await req.json().catch(() => null);
  if (!body || !body.title) return jerror(400, "title required");
  const payload = {
    product: {
      title: body.title,
      body_html: body.desc || "",
      vendor: body.category || "",
      product_type: body.unit ? body.unit.replace(/^\/\s*/, "") : "",
      variants: [{ price: String(body.priceJpy ?? 0) }],
    },
  };
  // Admin API distinguishes create vs update by URL path; for simplicity
  // the prototype only creates here. Real edits would PUT to /products/{id}.
  const res = await fetch(
    `https://${process.env.SHOPIFY_STORE_DOMAIN}/admin/api/${API_VERSION}/products.json`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Shopify-Access-Token": process.env.SHOPIFY_ADMIN_TOKEN,
      },
      body: JSON.stringify(payload),
    }
  );
  if (!res.ok) {
    return jerror(502, `Shopify Admin ${res.status}`, await res.text());
  }
  const created = await res.json();
  return Response.json(toLocalShape({ ...created.product, handle: created.product?.handle }));
}
