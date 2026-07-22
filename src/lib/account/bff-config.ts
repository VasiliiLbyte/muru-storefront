/** httpOnly refresh cookie name (server + proxy guard). */
export const REFRESH_COOKIE_NAME = "muru_customer_rt";

/** ~180 days in seconds. */
export const REFRESH_COOKIE_MAX_AGE = 180 * 24 * 60 * 60;

/**
 * Upstream API base for account BFF (server-only).
 * Prefer MURU_API_BASE; fall back to NEXT_PUBLIC_API_BASE.
 */
export function resolveAccountApiBase(): string {
  const base =
    process.env.MURU_API_BASE?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE?.trim() ||
    "";
  return base.replace(/\/$/, "");
}
