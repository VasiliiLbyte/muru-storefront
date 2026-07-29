"use client";

import { ShoppingBag } from "lucide-react";

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
        // Mobile: compact icon in bottom-right of image
        "absolute right-2 bottom-2 z-20 inline-flex size-11 items-center justify-center bg-background/85 text-text-heading backdrop-blur-sm transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        // Desktop: full-bleed brand bar (parity with pre-M7)
        "lg:inset-x-0 lg:right-auto lg:bottom-0 lg:size-auto lg:w-full lg:bg-brand lg:py-3 lg:text-center lg:text-body lg:text-text-inverse lg:backdrop-blur-none lg:hover:bg-brand-hover lg:hover:text-text-inverse",
        className,
      )}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(sku);
      }}
    >
      <ShoppingBag className="size-5 lg:hidden" aria-hidden />
      <span className="hidden lg:inline">Добавить в корзину</span>
    </button>
  );
}
