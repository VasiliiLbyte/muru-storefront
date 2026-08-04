"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";
import { useCartQty, useCartStore } from "@/stores/cart-store";

/** Кнопка «Добавить в корзину» / qty stepper на карточке листинга. */
export function AddToCartButton({
  sku,
  productTitle,
  imageUrl,
  className,
}: {
  sku: string;
  productTitle?: string;
  imageUrl?: string;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const updateQty = useCartStore((s) => s.updateQty);
  const showAddedToast = useCartStore((s) => s.showAddedToast);
  const qty = useCartQty(sku);
  const title = productTitle ?? sku;
  const label = productTitle
    ? `Добавить «${productTitle}» в корзину`
    : `Добавить ${sku} в корзину`;

  const barClass = cn(
    "absolute inset-x-0 bottom-0 z-20 inline-flex h-9 w-full items-center justify-center bg-brand text-[14px] leading-[17px] font-light text-text-inverse",
    className,
  );

  if (qty >= 1) {
    return (
      <div
        className={barClass}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
        }}
      >
        <button
          type="button"
          aria-label={`Уменьшить количество «${title}»`}
          className="inline-flex size-9 shrink-0 items-center justify-center transition-colors hover:bg-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            updateQty(sku, qty - 1);
          }}
        >
          <Minus className="size-4" strokeWidth={1.75} />
        </button>
        <span className="min-w-8 flex-1 text-center tabular-nums" aria-live="polite">
          {qty}
        </span>
        <button
          type="button"
          aria-label={`Увеличить количество «${title}»`}
          className="inline-flex size-9 shrink-0 items-center justify-center transition-colors hover:bg-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            updateQty(sku, qty + 1);
          }}
        >
          <Plus className="size-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      aria-label={label}
      className={cn(barClass, "hover:bg-brand-hover focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none")}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        addItem(sku);
        showAddedToast({ sku, title, imageUrl });
      }}
    >
      Добавить в корзину
    </button>
  );
}
