"use client";

import Image from "next/image";
import Link from "next/link";

import { productHref } from "@/lib/catalog/urls";
import { formatPrice } from "@/lib/format";
import type { Hotspot, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export type HotspotProductPopoverProps = {
  hotspot: Hotspot;
  product?: Product;
  onClose: () => void;
  className?: string;
};

/**
 * Поповер товара по клику на hotspot-маркер.
 */
export function HotspotProductPopover({
  hotspot,
  product,
  onClose,
  className,
}: HotspotProductPopoverProps) {
  const imageUrl =
    product?.images[0]?.url ?? hotspot.product.image ?? undefined;
  const title = product?.title ?? hotspot.product.name;
  const href = product ? productHref(product) : hotspot.product.slug;
  const showSale = product?.isOnSale && product.oldPrice;

  return (
    <div
      role="dialog"
      aria-label={`Товар ${hotspot.product.sku}`}
      className={cn(
        "relative z-20 w-56 border border-border bg-background p-3 shadow-(--shadow-overlay)",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="absolute top-2 right-2 flex size-6 items-center justify-center text-text-muted transition-colors hover:text-text-heading focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        aria-label="Закрыть"
      >
        ×
      </button>

      {imageUrl ? (
        <div className="relative mb-3 aspect-square w-full overflow-hidden bg-surface">
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="224px"
            className="object-cover"
          />
        </div>
      ) : null}

      <p className="pr-6 font-display text-body text-text-heading">{title}</p>

      <div className="mt-2 flex flex-wrap items-baseline gap-2">
        {product ? (
          <>
            <span className="text-body font-medium text-text-heading">
              {formatPrice(product.price, product.currency)}
            </span>
            {showSale ? (
              <span className="text-small text-text-secondary line-through">
                {formatPrice(product.oldPrice!, product.currency)}
              </span>
            ) : null}
          </>
        ) : (
          <span className="text-body font-medium text-text-heading">
            {formatPrice(hotspot.product.price)}
          </span>
        )}
      </div>

      <Link
        href={href}
        className="mt-3 inline-block text-small text-brand underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        Смотреть товар
      </Link>
    </div>
  );
}
