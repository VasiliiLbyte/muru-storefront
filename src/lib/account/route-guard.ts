import { REFRESH_COOKIE_NAME } from "./bff-config";

const PRIVATE_PREFIXES = [
  "/account",
  "/account/personal",
  "/account/orders",
  "/account/favorites",
  "/account/addresses",
] as const;

const AUTH_PATHS = [
  "/login",
  "/register",
  "/password/forgot",
  "/password/reset",
  "/verify",
] as const;

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname || "/";
}

export function isPrivateAccountPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return PRIVATE_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function isPublicAuthPath(pathname: string): boolean {
  const path = normalizePathname(pathname);
  return AUTH_PATHS.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function hasRefreshSessionCookie(
  cookieHeader: string | null | undefined,
): boolean {
  if (!cookieHeader) return false;
  return cookieHeader.split(";").some((part) => {
    const trimmed = part.trim();
    if (!trimmed.startsWith(`${REFRESH_COOKIE_NAME}=`)) return false;
    const value = trimmed.slice(REFRESH_COOKIE_NAME.length + 1);
    try {
      return decodeURIComponent(value).trim().length > 0;
    } catch {
      return value.trim().length > 0;
    }
  });
}

export function loginRedirectUrl(
  origin: string,
  pathname: string,
  search: string,
): string {
  const next = `${pathname}${search}`;
  const url = new URL("/login/", origin);
  url.searchParams.set("next", next);
  return url.toString();
}

export function accountHomeUrl(origin: string): string {
  return new URL("/account/", origin).toString();
}

export type GuardDecision =
  | { type: "next" }
  | { type: "redirect"; location: string };

/** Pure guard decision for unit tests and proxy.ts. */
export function decideAccountGuard(input: {
  pathname: string;
  search: string;
  origin: string;
  cookieHeader: string | null | undefined;
}): GuardDecision {
  const hasSession = hasRefreshSessionCookie(input.cookieHeader);

  if (isPrivateAccountPath(input.pathname) && !hasSession) {
    return {
      type: "redirect",
      location: loginRedirectUrl(input.origin, input.pathname, input.search),
    };
  }

  if (isPublicAuthPath(input.pathname) && hasSession) {
    return {
      type: "redirect",
      location: accountHomeUrl(input.origin),
    };
  }

  return { type: "next" };
}
