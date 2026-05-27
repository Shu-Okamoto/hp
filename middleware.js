import { NextResponse } from "next/server";

/**
 * Hides /wireframes in production deploys.
 *
 * On Vercel:
 *   - production builds  → returns 410 Gone (also indexable as removed)
 *   - preview deploys    → passes through, with a noindex header
 *   - local dev          → passes through, no header
 *
 * `VERCEL_ENV` is set by Vercel automatically: "production" | "preview" | "development".
 * When missing (e.g. self-hosting) the middleware leaves the path alone.
 */
export function middleware(request) {
  const env = process.env.VERCEL_ENV;
  if (env === "production") {
    return new NextResponse("Gone", {
      status: 410,
      headers: {
        "content-type": "text/plain; charset=utf-8",
        "x-robots-tag": "noindex, nofollow",
        "cache-control": "public, max-age=0, must-revalidate",
      },
    });
  }
  const res = NextResponse.next();
  res.headers.set("x-robots-tag", "noindex, nofollow");
  return res;
}

export const config = {
  matcher: ["/wireframes", "/wireframes/:path*"],
};
