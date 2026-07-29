import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { decideAccountGuard } from "@/lib/account/route-guard";
import { decideCatalogRedirect } from "@/lib/seo/decide-catalog-redirect";

/**
 * Next.js 16 Proxy (formerly Middleware):
 * 1) O(1) URL migration 301 / 410 for catalog legacy paths
 *    (incl. no-slash → map target in one hop; case canonicalize)
 * 2) Trailing-slash / latin-case canonicalize for non-map paths
 *    (requires skipTrailingSlashRedirect in next.config)
 * 3) Cookie-based account route guard
 */
export function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  const catalogDecision = decideCatalogRedirect(pathname);
  if (catalogDecision.type === "redirect") {
    // Build Location via URL() so trailing slash on destination is preserved
    // under skipTrailingSlashRedirect (nextUrl.pathname assignment strips it).
    const url = new URL(catalogDecision.location, request.nextUrl.origin);
    url.search = request.nextUrl.search;
    return NextResponse.redirect(url, catalogDecision.status);
  }
  if (catalogDecision.type === "gone") {
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
  // Broad matcher so trailing-slash handling works after skipTrailingSlashRedirect.
  // Exclude Next internals, API, and static files with extensions.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/|.*\\..*).*)",
    "/",
  ],
};
