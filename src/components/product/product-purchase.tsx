"use client";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { Button } from "@/components/ui/button";
import { discountPercent, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/schemas";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

export function ProductPurchase({
  product,
  className,
}: {
  product: Product;
  className?: string;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const showSale = product.isOnSale && product.oldPrice;
  const discount = showSale
    ? discountPercent(product.price, product.oldPrice!)
    : 0;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <div className="flex items-start justify-between gap-4">
        <h1 className="font-display text-display text-text-heading">
          {product.title}
        </h1>
        <FavoriteToggle
          sku={product.sku}
          productTitle={product.title}
          className="shrink-0"
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-3">
        <span className="text-h2 font-medium text-text-heading">
          {formatPrice(product.price, product.currency)}
        </span>
        {showSale ? (
          <>
            <span className="text-body text-text-secondary line-through">
              {formatPrice(product.oldPrice!, product.currency)}
            </span>
            {discount > 0 ? (
              <span className="bg-brand px-2 py-0.5 text-caption font-medium text-text-inverse">
                −{discount}%
              </span>
            ) : (
              <span className="bg-brand px-2 py-0.5 text-caption font-medium text-text-inverse">
                Распродажа
              </span>
            )}
          </>
        ) : null}
      </div>

      {!product.inStock ? (
        <p className="text-small text-text-secondary">Нет в наличии</p>
      ) : null}

      {product.inStock ? (
        <Button
          type="button"
          size="lg"
          className="h-11 w-full max-w-sm bg-brand px-6 text-body text-text-inverse hover:bg-brand-hover sm:w-auto"
          onClick={() => addItem(product.sku)}
        >
          В корзину
        </Button>
      ) : null}
    </div>
  );
}
