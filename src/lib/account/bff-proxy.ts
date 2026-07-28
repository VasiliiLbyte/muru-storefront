import { resolveAccountApiBase } from "./bff-config";

/**
 * Client IP for rate-limit / captcha on the upstream.
 * Prefer last hop of x-forwarded-for (nginx appends), then x-real-ip.
 */
export function resolveClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const hops = xff.split(",");
    for (let i = hops.length - 1; i >= 0; i -= 1) {
      const hop = hops[i]?.trim();
      if (hop) return hop;
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

/** Server-only shared secret with backend; empty in local/dev is OK. */
export function getInternalProxyToken(): string | null {
  const token = process.env.INTERNAL_PROXY_TOKEN?.trim();
  return token && token.length > 0 ? token : null;
}

export class AccountPathNotAllowedError extends Error {
  constructor(message = "Account path not allowed") {
    super(message);
    this.name = "AccountPathNotAllowedError";
  }
}

const EXACT_ACCOUNT_PATHS = new Set([
  "login",
  "logout",
  "refresh",
  "register",
  "verify",
  "resend-verify",
  "password/forgot",
  "password/reset",
  "me",
  "me/password",
  "addresses",
  "orders",
  "favorites",
]);

const SAFE_ID_RE =
  /^(?:\d+|[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/;

function decodePathSegment(segment: string): string {
  try {
    return decodeURIComponent(segment);
  } catch {
    return segment;
  }
}

function isSafeIdSegment(segment: string): boolean {
  return SAFE_ID_RE.test(segment);
}

/** Reject traversal / unknown paths before any upstream fetch. */
export function assertAllowedAccountPath(pathSegments: string[]): void {
  if (pathSegments.length === 0) {
    throw new AccountPathNotAllowedError();
  }

  const decoded: string[] = [];
  for (const raw of pathSegments) {
    const segment = decodePathSegment(raw);
    if (
      !segment ||
      segment === "." ||
      segment === ".." ||
      segment.includes("/") ||
      segment.includes("\\")
    ) {
      throw new AccountPathNotAllowedError();
    }
    decoded.push(segment);
  }

  const pathKey = decoded.join("/");
  if (EXACT_ACCOUNT_PATHS.has(pathKey)) return;

  if (
    decoded.length === 2 &&
    (decoded[0] === "addresses" || decoded[0] === "orders") &&
    isSafeIdSegment(decoded[1]!)
  ) {
    return;
  }

  throw new AccountPathNotAllowedError();
}

export function buildUpstreamAccountUrl(
  pathSegments: string[],
  search: string,
): string {
  assertAllowedAccountPath(pathSegments);

  const base = resolveAccountApiBase();
  if (!base) {
    throw new Error("MURU_API_BASE (or NEXT_PUBLIC_API_BASE) is not configured");
  }
  const path = pathSegments.map(encodeURIComponent).join("/");
  return `${base}/account/${path}${search}`;
}

export type ProxyUpstreamInit = {
  method: string;
  headers: HeadersInit;
  body?: string | null;
};

/**
 * Build headers for the upstream fetch: JSON, client IP, optional Bearer.
 * Sends X-Client-IP (+ X-Internal-Proxy-Token when configured).
 * Does not forge X-Forwarded-For / X-Real-IP.
 */
export function buildUpstreamHeaders(
  request: Request,
  options?: { contentType?: string | null; hasBody?: boolean },
): Headers {
  const headers = new Headers();
  const ip = resolveClientIp(request);
  headers.set("X-Client-IP", ip);

  const proxyToken = getInternalProxyToken();
  if (proxyToken) {
    headers.set("X-Internal-Proxy-Token", proxyToken);
  }

  headers.set("Accept", "application/json");

  const auth = request.headers.get("authorization");
  if (auth) headers.set("Authorization", auth);

  if (options?.hasBody) {
    headers.set(
      "Content-Type",
      options.contentType ?? "application/json",
    );
  }

  return headers;
}

/** Perform upstream fetch (exported for tests via injectable fetch). */
export async function proxyToUpstream(
  url: string,
  init: ProxyUpstreamInit,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  return fetchImpl(url, {
    method: init.method,
    headers: init.headers,
    body: init.body ?? undefined,
    cache: "no-store",
  });
}
