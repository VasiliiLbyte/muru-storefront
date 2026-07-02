import type { Image } from "@/lib/schemas";
import { PLACEHOLDER_BLUR } from "@/lib/images";

/**
 * Нейтральные плейсхолдеры изображений (политика контента: НЕ копируем muru.ru).
 * Используется один локальный серый SVG + статичный blur-плейсхолдер.
 */

/** Локальный серый SVG-плейсхолдер (см. public/placeholders/product.svg). */
export const PLACEHOLDER_URL = "/placeholders/product.svg";

export { PLACEHOLDER_BLUR };

/** Конструирует валидный (по ImageSchema) объект изображения-плейсхолдера. */
export function makeImage(alt: string): Image {
  return {
    url: PLACEHOLDER_URL,
    alt,
    width: 1000,
    height: 1000,
    blurDataURL: PLACEHOLDER_BLUR,
  };
}
