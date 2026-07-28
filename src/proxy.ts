import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { decideAccountGuard } from "@/lib/account/route-guard";
import { normalizeRedirectPath } from "@/lib/seo/normalize-redirect-path";
import { GONE_PATHS, REDIRECT_MAP } from "@/lib/seo/redirect-map.generated";

/**
 * Next.js 16 Proxy (formerly Middleware):
 * 1) O(1) URL migration 301 / 410 for catalog legacy paths
 * 2) Cookie-based account route guard
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const key = normalizeRedirectPath(pathname);

  const dest = REDIRECT_MAP.get(key);
  if (dest) {
    const url = request.nextUrl.clone();
    url.pathname = dest;
    return NextResponse.redirect(url, 301);
  }

  if (GONE_PATHS.has(key)) {
    return new NextResponse(null, { status: 410 });
  }

  const decision = decideAccountGuard({
    pathname,
    search: request.nextUrl.search,
    origin: request.nextUrl.origin,
    cookieHeader: request.headers.get("cookie"),
  });

  if (decision.type === "redirect") {
    return NextResponse.redirect(decision.location);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/catalog",
    "/catalog/:path*",
    "/account",
    "/account/:path*",
    "/login",
    "/login/:path*",
    "/register",
    "/register/:path*",
    "/password/forgot",
    "/password/forgot/:path*",
    "/password/reset",
    "/password/reset/:path*",
    "/verify",
    "/verify/:path*",
  ],
};
