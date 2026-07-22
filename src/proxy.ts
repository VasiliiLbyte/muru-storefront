import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { decideAccountGuard } from "@/lib/account/route-guard";

/**
 * Next.js 16 Proxy (formerly Middleware): cookie-based account route guard.
 * Refresh lives in httpOnly `muru_customer_rt`; absence ⇒ redirect to /login/.
 */
export function proxy(request: NextRequest) {
  const decision = decideAccountGuard({
    pathname: request.nextUrl.pathname,
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
