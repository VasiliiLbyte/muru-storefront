"use client";

import { cn } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";

/** Кнопка «Добавить в корзину» на карточке товара в листинге каталога. */
export function AddToCartButton({
  sku,
  productTitle,
  className,
}: {
  sku: string;
  productTitle?: string;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const label = productTitle
    ? `Добавить «${productTitle}» в корзину`
    : `Добавить ${sku} в корзину`;

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        // parity: muru.ru mobile button.to_cart — full-bleed bar, 36px / 14px / brand
        "absolute inset-x-0 bottom-0 z-20 inline-flex h-9 w-full items-center justify-center bg-brand text-[14px] leading-[17px] font-light text-text-inverse transition-colors hover:bg-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
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
