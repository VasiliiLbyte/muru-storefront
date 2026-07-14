/**
 * Общие константы и хелперы для next/image.
 * Используются в prod-компонентах и реэкспортируются из MSW-fixtures.
 */

import { ASSETS_BASE } from "@/lib/assets-base";

/** Крошечный blurDataURL (однотонный surface-цвет #f4f0e8) для next/image. */
export const PLACEHOLDER_BLUR =
  "data:image/gif;base64,R0lGODlhAQABAPAAAPTw6P///yH5BAAAAAAALAAAAAABAAEAAAICRAEAOw==";

/** Blur-плейсхолдер для статичных SVG/растров из /public. */
export function staticBlurProps() {
  return {
    placeholder: "blur" as const,
    blurDataURL: PLACEHOLDER_BLUR,
  };
}

const DRIVE_FILE_ID_PATTERNS = [/[?&]id=([^&]+)/i, /\/file\/d\/([^/]+)/i];

export function extractDriveFileId(url: string): string | null {
  for (const pattern of DRIVE_FILE_ID_PATTERNS) {
    const match = url.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

export type CatalogImageWidth = 320 | 600 | 1200;

/** Drive/crm fake URL → /img/ прокси на ASSETS_BASE (cross-domain витрина). */
export function resolveCatalogImageUrl(
  rawUrl: string | null | undefined,
  width: CatalogImageWidth = 600,
): string | null {
  if (!rawUrl?.trim()) return null;
  const trimmed = rawUrl.trim();
  const fileId = extractDriveFileId(trimmed);
  if (fileId) return `${ASSETS_BASE}/img/${fileId}/${width}.webp`;
  if (trimmed.startsWith("/img/")) return `${ASSETS_BASE}${trimmed}`;
  if (trimmed.startsWith("/uploads/")) return `${ASSETS_BASE}${trimmed}`;
  return trimmed;
}
