"use client";

import { Minus, Plus, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { productHref } from "@/lib/catalog/urls";
import { formatPrice } from "@/lib/format";
import type { CartItem, Product } from "@/lib/schemas";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function BasketLine({
  item,
  product,
  className,
}: {
  item: CartItem;
  product: Product;
  className?: string;
}) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);
  const image = product.images[0];

  const commitQty = (raw: string) => {
    const parsed = Number.parseInt(raw, 10);
    if (Number.isNaN(parsed)) return;
    updateQty(item.sku, parsed);
  };

  return (
    <article
      className={cn(
        "grid grid-cols-[5rem_1fr] gap-4 border-b border-border py-6 sm:grid-cols-[7rem_1fr_auto]",
        className,
      )}
    >
      <Link
        href={productHref(product)}
        className="relative aspect-[4/5] overflow-hidden bg-surface"
      >
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? product.title}
            fill
            sizes="112px"
            placeholder={image.blurDataURL ? "blur" : undefined}
            blurDataURL={image.blurDataURL}
            className="object-cover"
          />
        ) : null}
      </Link>

      <div className="flex min-w-0 flex-col gap-3">
        <Link
          href={productHref(product)}
          className="text-body text-text-heading transition-colors hover:text-brand"
        >
          {product.title}
        </Link>
        <p className="text-body font-medium text-text-heading">
          {formatPrice(product.price, product.currency)}
        </p>

        <div className="flex flex-wrap items-center gap-3">
          <div
            className="inline-flex items-center border border-border"
            role="group"
            aria-label={`Количество: ${product.title}`}
          >
            <button
              type="button"
              aria-label="Уменьшить количество"
              onClick={() => updateQty(item.sku, item.qty - 1)}
              className="inline-flex size-9 items-center justify-center text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Minus className="size-4" />
            </button>
            <label className="sr-only" htmlFor={`qty-${item.sku}`}>
              Количество
            </label>
            <input
              id={`qty-${item.sku}`}
              key={item.qty}
              type="number"
              min={1}
              inputMode="numeric"
              defaultValue={item.qty}
              onBlur={(e) => commitQty(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitQty(e.currentTarget.value);
              }}
              className="h-9 w-12 border-x border-border bg-background text-center text-body text-foreground focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            />
            <button
              type="button"
              aria-label="Увеличить количество"
              onClick={() => updateQty(item.sku, item.qty + 1)}
              className="inline-flex size-9 items-center justify-center text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <Plus className="size-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => removeItem(item.sku)}
            className="inline-flex items-center gap-1 text-small text-text-muted transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Trash2 className="size-4" aria-hidden="true" />
            Удалить
          </button>
        </div>
      </div>

      <p className="hidden text-body font-medium text-text-heading sm:block sm:text-right">
        {formatPrice(product.price * item.qty, product.currency)}
      </p>
    </article>
  );
}
