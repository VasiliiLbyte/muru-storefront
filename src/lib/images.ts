/**
 * Общие константы и хелперы для next/image.
 * Используются в prod-компонентах и реэкспортируются из MSW-fixtures.
 */

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
