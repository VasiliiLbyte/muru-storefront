"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";

import { IconBasket } from "@/components/icons";

import { buttonVariants } from "@/components/ui/button";
import { badgeClass } from "@/components/layout/header-actions";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { productHref } from "@/lib/catalog/urls";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import { useCartTotals } from "@/lib/cart/use-cart-totals";
import { formatPrice } from "@/lib/format";
import { catalogHref } from "@/lib/site";
import type { Product } from "@/lib/schemas";
import { useCartCount, useCartItems, useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const PREVIEW_LIMIT = 5;

export function MiniCart({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  void compact;
  const [open, setOpen] = useState(false);
  const count = useCartCount();
  const items = useCartItems();
  const updateQty = useCartStore((s) => s.updateQty);
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

  const skusKey = useMemo(
    () => items.map((i) => i.sku).sort().join(","),
    [items],
  );

  useEffect(() => {
    if (!open || items.length === 0) return;
    let cancelled = false;
    hydrateCartProducts(items.map((i) => i.sku)).then((map) => {
      if (!cancelled) setProductsBySku(map);
    });
    return () => {
      cancelled = true;
    };
  }, [open, skusKey, items]);

  const totals = useCartTotals(productsBySku);
  const previewItems = items
    .filter((i) => productsBySku.has(i.sku))
    .slice(0, PREVIEW_LIMIT);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label={count ? `Корзина (${count})` : "Корзина"}
        className={cn(
          "relative inline-flex flex-col items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:min-h-0 lg:min-w-[3.5rem] lg:w-auto lg:gap-1 lg:px-2",
          className,
        )}
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      >
        <span className="relative inline-flex size-6 items-center justify-center">
          <IconBasket className="size-5" />
          {count ? (
            <span aria-hidden="true" className={badgeClass}>
              {count}
            </span>
          ) : null}
        </span>
        <span className="hidden text-[12px] leading-none text-text-secondary lg:block">
          Корзина
        </span>
      </SheetTrigger>

      <SheetContent side="right" className="gap-4">
        <SheetHeader>
          <SheetTitle className="font-display text-h2 text-text-heading">
            Корзина
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col gap-4">
            <p className="text-body text-text-secondary">Корзина пуста</p>
            <Link
              href={catalogHref.root}
              onClick={() => setOpen(false)}
              className={cn(buttonVariants(), "h-10")}
            >
              Перейти в каталог
            </Link>
          </div>
        ) : (
          <div className="flex flex-1 flex-col gap-6">
            <ul className="flex flex-col gap-4">
              {previewItems.map((item) => {
                const product = productsBySku.get(item.sku);
                if (!product) return null;
                const image = product.images[0];
                return (
                  <li key={item.sku} className="flex gap-3">
                    <Link
                      href={productHref(product)}
                      onClick={() => setOpen(false)}
                      className="relative block size-16 shrink-0 overflow-hidden bg-surface"
                    >
                      {image ? (
                        <Image
                          src={image.url}
                          alt={image.alt ?? product.title}
                          fill
                          sizes="64px"
                          placeholder={image.blurDataURL ? "blur" : undefined}
                          blurDataURL={image.blurDataURL}
                          className="object-cover"
                        />
                      ) : null}
                    </Link>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                      <Link
                        href={productHref(product)}
                        onClick={() => setOpen(false)}
                        className="truncate text-small text-text-heading hover:text-brand"
                      >
                        {product.title}
                      </Link>
                      <p className="text-small font-medium text-text-heading">
                        {formatPrice(product.price, product.currency)}
                      </p>
                      <div
                        className="inline-flex w-fit items-center border border-border"
                        role="group"
                        aria-label={`Количество: ${product.title}`}
                      >
                        <button
                          type="button"
                          aria-label="Уменьшить количество"
                          onClick={() => updateQty(item.sku, item.qty - 1)}
                          className="inline-flex size-8 items-center justify-center text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span
                          className="min-w-8 border-x border-border px-1 text-center text-small text-foreground"
                          aria-live="polite"
                        >
                          {item.qty}
                        </span>
                        <button
                          type="button"
                          aria-label="Увеличить количество"
                          onClick={() => updateQty(item.sku, item.qty + 1)}
                          className="inline-flex size-8 items-center justify-center text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {items.length > PREVIEW_LIMIT ? (
              <p className="text-small text-text-muted">
                и ещё {items.length - PREVIEW_LIMIT} поз.
              </p>
            ) : null}

            <div className="mt-auto flex flex-col gap-3 border-t border-border pt-4">
              <div className="flex justify-between text-body">
                <span className="text-text-secondary">Итого</span>
                <span className="font-medium text-text-heading">
                  {formatPrice(totals.subtotal)}
                </span>
              </div>
              <Link
                href="/basket/"
                onClick={() => setOpen(false)}
                className={cn(
                  buttonVariants(),
                  "h-10 w-full text-center",
                )}
              >
                Перейти в корзину
              </Link>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
