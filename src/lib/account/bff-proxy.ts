import { resolveAccountApiBase } from "./bff-config";

/**
 * Client IP for rate-limit / captcha on the upstream.
 * Prefer first hop of x-forwarded-for, then x-real-ip.
 */
export function resolveClientIp(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return realIp;
  return "127.0.0.1";
}

export function buildUpstreamAccountUrl(
  pathSegments: string[],
  search: string,
): string {
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
 */
export function buildUpstreamHeaders(
  request: Request,
  options?: { contentType?: string | null; hasBody?: boolean },
): Headers {
  const headers = new Headers();
  const ip = resolveClientIp(request);
  headers.set("X-Forwarded-For", ip);
  headers.set("X-Real-IP", ip);
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
