"use client";

import { useEffect, useState, type RefObject } from "react";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/schemas";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

/**
 * Mobile sticky buy bar: shows when the main «В корзину» CTA scrolls above
 * the viewport; hides near footer and while Base UI overlays lock scroll.
 */
export function ProductStickyBuyBar({
  product,
  cartCtaRef,
}: {
  product: Product;
  cartCtaRef: RefObject<HTMLElement | null>;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const showAddedToast = useCartStore((s) => s.showAddedToast);
  const [ctaAbove, setCtaAbove] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

  useEffect(() => {
    const cta = cartCtaRef.current;
    if (!cta) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        // Show only after the CTA has scrolled past the top of the viewport.
        setCtaAbove(
          !entry.isIntersecting && entry.boundingClientRect.top < 0,
        );
      },
      { threshold: 0, rootMargin: "0px" },
    );
    observer.observe(cta);
    return () => observer.disconnect();
  }, [cartCtaRef]);

  useEffect(() => {
    const footer = document.querySelector("footer");
    if (!footer) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setFooterVisible(Boolean(entry?.isIntersecting));
      },
      { threshold: 0 },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const html = document.documentElement;
    const sync = () =>
      setScrollLocked(html.hasAttribute("data-base-ui-scroll-locked"));
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(html, { attributes: true, attributeFilter: ["data-base-ui-scroll-locked"] });
    return () => mo.disconnect();
  }, []);

  const visible = ctaAbove && !footerVisible && !scrollLocked;

  return (
    <div
      className={cn(
        "fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background pb-safe lg:hidden",
        "transition-[transform,opacity] duration-200 motion-reduce:transition-none",
        visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-full opacity-0",
      )}
      aria-hidden={!visible}
    >
      {/* Кнопка во всю ширину + сердце рядом (стилистика kuchenland).
          Цена уже видна выше по странице, здесь её не дублируем. */}
      <div className="mx-auto flex max-w-[1564px] items-center gap-2 px-4 py-3">
        <Button
          type="button"
          size="lg"
          className="min-h-12 flex-1 bg-brand px-6 text-body text-text-inverse hover:bg-brand-hover"
          tabIndex={visible ? 0 : -1}
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
        <FavoriteToggle
          sku={product.sku}
          productTitle={product.title}
          className="size-12 shrink-0 border border-border bg-transparent backdrop-blur-none"
        />
      </div>
    </div>
  );
}
