import {
  REFRESH_COOKIE_MAX_AGE,
  REFRESH_COOKIE_NAME,
} from "./bff-config";

export type RefreshCookieOptions = {
  value: string;
  secure?: boolean;
};

/** Serialize Set-Cookie for the refresh token. */
export function serializeRefreshCookie({
  value,
  secure = process.env.NODE_ENV === "production",
}: RefreshCookieOptions): string {
  const parts = [
    `${REFRESH_COOKIE_NAME}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${REFRESH_COOKIE_MAX_AGE}`,
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

/** Clear refresh cookie. */
export function serializeClearRefreshCookie(
  secure = process.env.NODE_ENV === "production",
): string {
  const parts = [
    `${REFRESH_COOKIE_NAME}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    "Expires=Thu, 01 Jan 1970 00:00:00 GMT",
  ];
  if (secure) parts.push("Secure");
  return parts.join("; ");
}

export function readRefreshCookie(
  cookieHeader: string | null,
): string | undefined {
  if (!cookieHeader) return undefined;
  const parts = cookieHeader.split(";");
  for (const part of parts) {
    const [rawName, ...rest] = part.trim().split("=");
    if (rawName === REFRESH_COOKIE_NAME) {
      const raw = rest.join("=");
      try {
        return decodeURIComponent(raw);
      } catch {
        return raw;
      }
    }
  }
  return undefined;
}
