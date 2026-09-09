"use client";

import { Minus, Plus } from "lucide-react";

import { IconBasket } from "@/components/icons";
import { cardGlyphClass } from "@/components/catalog/favorite-toggle";
import { badgeClass } from "@/components/layout/header-actions";
import { cn } from "@/lib/utils";
import { useCartQty, useCartStore } from "@/stores/cart-store";

export type AddToCartVariant = "bar" | "icon";

/**
 * Добавление в корзину с карточки.
 *
 * `bar` — полноширинная полоса + степпер (легаси, остался для мест,
 * где карточка не в сетке каталога).
 * `icon` — белая контурная корзина в углу фото со счётчиком (сетка
 * каталога, макет `сайт_2.pdf` / CARD-001). Тап = +1, уменьшение — в
 * корзине. Цвет и тень — как у сердца, см. `FavoriteToggle`.
 */
export function AddToCartButton({
  sku,
  productTitle,
  imageUrl,
  variant = "bar",
  className,
}: {
  sku: string;
  productTitle?: string;
  imageUrl?: string;
  variant?: AddToCartVariant;
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

  const add = (event: { preventDefault: () => void; stopPropagation: () => void }) => {
    event.preventDefault();
    event.stopPropagation();
    addItem(sku);
    showAddedToast({ sku, title, imageUrl });
  };

  if (variant === "icon") {
    return (
      <button
        type="button"
        aria-label={qty >= 1 ? `${label} (в корзине: ${qty})` : label}
        onClick={add}
        className={cn(
          "inline-flex size-11 items-center justify-center text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)] transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
          className,
        )}
      >
        <span className={cn("relative inline-flex items-center justify-center", cardGlyphClass)}>
          <IconBasket className={cardGlyphClass} />
          {qty >= 1 ? (
            <span aria-hidden="true" className={badgeClass}>
              {qty}
            </span>
          ) : null}
        </span>
      </button>
    );
  }

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
      onClick={add}
    >
      Добавить в корзину
    </button>
  );
}
