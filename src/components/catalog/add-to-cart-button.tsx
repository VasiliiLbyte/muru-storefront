"use client";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/** Кнопка «Добавить в корзину» на карточке товара в листинге каталога. */
export function AddToCartButton({
  sku,
  className,
}: {
  sku: string;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);

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
        addItem(sku);
      }}
    >
      Добавить в корзину
    </button>
  );
}
