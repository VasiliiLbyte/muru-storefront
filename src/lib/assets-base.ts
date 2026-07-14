const catalogOrApiBase =
  process.env.NEXT_PUBLIC_CATALOG_API_BASE ??
  process.env.NEXT_PUBLIC_API_BASE ??
  "";

export const ASSETS_BASE =
  process.env.NEXT_PUBLIC_ASSETS_BASE ||
  catalogOrApiBase.replace(/\/api\/?$/, "");

export function resolveAssetUrl(url: string): string {
  if (url.startsWith("/uploads/")) {
    return `${ASSETS_BASE}${url}`;
  }
  return url;
}
