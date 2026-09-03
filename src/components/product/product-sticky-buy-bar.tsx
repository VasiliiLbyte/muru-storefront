"use client";

import { useEffect, useState } from "react";

import { FavoriteToggle } from "@/components/catalog/favorite-toggle";
import { Button } from "@/components/ui/button";
import type { Product } from "@/lib/schemas";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

/**
 * Мобильная панель покупки, закреплённая внизу экрана (стилистика
 * kuchenland): «Купить в 1 клик» + «В корзину» + избранное.
 *
 * Видна сразу, без прокрутки — на мобиле это единственный CTA, кнопки
 * в потоке скрыты (`max-lg:hidden` в `ProductPurchase`). Прячется только
 * у подвала, чтобы не перекрывать его ссылки, и когда оверлей Base UI
 * лочит скролл (иначе панель висит поверх модалки).
 */
export function ProductStickyBuyBar({
  product,
  onOneClick,
}: {
  product: Product;
  onOneClick: () => void;
}) {
  const addItem = useCartStore((s) => s.addItem);
  const showAddedToast = useCartStore((s) => s.showAddedToast);
  const [footerVisible, setFooterVisible] = useState(false);
  const [scrollLocked, setScrollLocked] = useState(false);

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

  // Любой открытый оверлей Base UI (модалка «Купить в 1 клик», мини-корзина,
  // поиск, меню) портируется прямым потомком body и лочит скролл через
  // inline `overflow: hidden` на body. Раньше здесь проверялся атрибут
  // `data-base-ui-scroll-locked` на <html> — в текущей версии Base UI его
  // нет, гард молча не срабатывал, и панель просвечивала поверх модалки.
  useEffect(() => {
    const body = document.body;
    const sync = () =>
      setScrollLocked(
        body.style.overflow === "hidden" ||
          document.querySelector('[role="dialog"]') !== null,
      );
    sync();
    const mo = new MutationObserver(sync);
    mo.observe(body, {
      attributes: true,
      attributeFilter: ["style"],
      childList: true,
    });
    return () => mo.disconnect();
  }, []);

  const visible = !footerVisible && !scrollLocked;

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
      <div className="mx-auto flex max-w-[1564px] items-center gap-2 px-4 py-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="min-h-12 min-w-0 flex-1 px-3 text-[14px] leading-[17px]"
          tabIndex={visible ? 0 : -1}
          onClick={onOneClick}
        >
          Купить в 1 клик
        </Button>
        <Button
          type="button"
          size="lg"
          className="min-h-12 min-w-0 flex-1 bg-brand px-3 text-[14px] leading-[17px] text-text-inverse hover:bg-brand-hover"
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
