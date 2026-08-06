import { normalizeRedirectPath } from "@/lib/seo/normalize-redirect-path";
import { GONE_PATHS, REDIRECT_MAP } from "@/lib/seo/redirect-map.generated";

export type CatalogRedirectDecision =
  | { type: "redirect"; location: string; status: 301 }
  | { type: "gone" }
  | { type: "next" };

/**
 * True only for Bitrix collapse `/catalog/{parent}/{sub}/` → `/catalog/{parent}/`.
 * Does not match category→root, product→listing, or cyrillic→latin renames.
 */
export function isSubcategoryToParentCollapse(
  source: string,
  dest: string,
): boolean {
  const src = source.split("/").filter(Boolean);
  const dst = dest.split("/").filter(Boolean);
  if (src.length !== 3 || src[0] !== "catalog") return false;
  if (dst.length !== 2 || dst[0] !== "catalog") return false;
  return dst[1] === src[1];
}

/**
 * Pure catalog URL migration decision for unit tests and proxy.ts.
 * Order: map hit (D2/D3 one-hop) → 410 → case/encoding canonicalize (D4).
 */
export function decideCatalogRedirect(pathname: string): CatalogRedirectDecision {
  const key = normalizeRedirectPath(pathname);

  const dest = REDIRECT_MAP.get(key);
  if (dest) {
    if (isSubcategoryToParentCollapse(key, dest)) {
      return { type: "next" };
    }
    return { type: "redirect", location: dest, status: 301 };
  }

  if (GONE_PATHS.has(key)) {
    return { type: "gone" };
  }

  // D4: uppercase / decode / missing trailing slash → canonical key
  if (pathname !== key) {
    return { type: "redirect", location: key, status: 301 };
  }

  return { type: "next" };
}
