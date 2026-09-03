"use client";

import { useRef, useState } from "react";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { OneClickBuyDialog } from "@/components/product/one-click-buy-dialog";
import { ProductStickyBuyBar } from "@/components/product/product-sticky-buy-bar";
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
  const showAddedToast = useCartStore((s) => s.showAddedToast);
  const [oneClickOpen, setOneClickOpen] = useState(false);
  const cartCtaRef = useRef<HTMLDivElement>(null);
  const showSale = product.isOnSale && product.oldPrice;
  const discount = showSale
    ? discountPercent(product.price, product.oldPrice!)
    : 0;

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      {/* На мобиле цена идёт НАД названием и крупнее его (стилистика
          kuchenland). В DOM `<h1>` остаётся первым — порядок только
          визуальный, через `order`. */}
      <div className="flex flex-col gap-1 lg:gap-6">
        <div className="flex items-start justify-between gap-4 max-lg:order-2">
          <h1 className="font-display text-display text-text-heading max-lg:text-[17px] max-lg:leading-[24px] max-lg:font-normal">
            {product.seoH1}
          </h1>
          {/* На мобиле сердце живёт в липкой нижней панели */}
          <FavoriteToggle
            sku={product.sku}
            productTitle={product.title}
            className="shrink-0 max-lg:hidden"
          />
        </div>

        <div className="flex flex-wrap items-baseline gap-3 max-lg:order-1">
          <span
            className={cn(
              // `text-[length:…]`, а не `text-h2`: tailwind-merge не отличает
              // размерный `text-h2` от цветового `text-text-heading` и молча
              // выбрасывал первый — цена на десктопе съезжала на 16px.
              "text-[length:var(--text-h2)] font-medium max-lg:text-[28px] max-lg:leading-[34px]",
              showSale ? "text-brand" : "text-text-heading",
            )}
          >
            {formatPrice(product.price, product.currency)}
          </span>
          {showSale ? (
            <>
              <span className="text-body text-text-secondary line-through">
                {formatPrice(product.oldPrice!, product.currency)}
              </span>
              <span className="bg-brand px-2 py-0.5 text-caption font-medium text-text-inverse">
                {discount > 0 ? `−${discount}%` : "Распродажа"}
              </span>
            </>
          ) : null}
        </div>
      </div>

      <p className="text-small text-text-secondary">
        {product.inStock ? "В наличии" : "Нет в наличии"}
      </p>

      {product.inStock ? (
        <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="min-h-12 w-full px-6 text-body lg:h-11 lg:w-auto"
            onClick={() => setOneClickOpen(true)}
          >
            Купить в 1 клик
          </Button>
          <div ref={cartCtaRef} className="w-full lg:w-auto">
            <Button
              type="button"
              size="lg"
              className="min-h-12 w-full bg-brand px-6 text-body text-text-inverse hover:bg-brand-hover lg:h-11 lg:w-auto"
              onClick={() => {
                addItem(product.sku);
                showAddedToast({
                  sku: product.sku,
                  title: product.title,
                  imageUrl: product.images[0]?.url,
                });
              }}
            >
              В корзину
            </Button>
          </div>
        </div>
      ) : null}

      {product.inStock ? (
        <>
          <OneClickBuyDialog
            product={product}
            open={oneClickOpen}
            onOpenChange={setOneClickOpen}
          />
          <ProductStickyBuyBar product={product} cartCtaRef={cartCtaRef} />
        </>
      ) : null}
    </div>
  );
}
