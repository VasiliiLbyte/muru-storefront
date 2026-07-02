"use client";

import { cn } from "@/lib/utils";

/**
 * Заглушка кнопки «Добавить в корзину» на карточке товара.
 * Полная интеграция с useCart — отдельный промпт.
 */
export function AddToCartButton({
  sku,
  className,
}: {
  sku: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-label={`Добавить ${sku} в корзину`}
      className={cn(
        "absolute inset-x-0 bottom-0 z-20 bg-brand py-3 text-center text-body text-text-inverse transition-colors hover:bg-brand-hover",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
      }}
    >
      Добавить в корзину
    </button>
  );
}
