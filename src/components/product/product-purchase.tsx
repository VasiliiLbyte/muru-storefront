"use client";

import { useState } from "react";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { OneClickBuyDialog } from "@/components/product/one-click-buy-dialog";
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
  const [oneClickOpen, setOneClickOpen] = useState(false);
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

      <p className="text-small text-text-secondary">
        {product.inStock ? "В наличии" : "Нет в наличии"}
      </p>

      {product.inStock ? (
        <div className="flex flex-wrap gap-3">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 px-6 text-body"
            onClick={() => setOneClickOpen(true)}
          >
            Купить в 1 клик
          </Button>
          <Button
            type="button"
            size="lg"
            className="h-11 bg-brand px-6 text-body text-text-inverse hover:bg-brand-hover"
            onClick={() => addItem(product.sku)}
          >
            В корзину
          </Button>
        </div>
      ) : null}

      {product.inStock ? (
        <OneClickBuyDialog
          product={product}
          open={oneClickOpen}
          onOpenChange={setOneClickOpen}
        />
      ) : null}
    </div>
  );
}
