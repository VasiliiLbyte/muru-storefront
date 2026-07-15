"use client";

import Image from "next/image";
import Link from "next/link";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { productHref } from "@/lib/catalog/urls";
import { formatPrice } from "@/lib/format";
import type { Hotspot, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const VIEWPORT_PADDING = 8;
const GAP = 8;

type PopoverPosition = {
  top: number;
  left: number;
};

function computePopoverPosition(
  anchorRect: DOMRect,
  popoverRect: DOMRect,
): PopoverPosition {
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  let left = anchorRect.right + GAP;
  let top = anchorRect.top + anchorRect.height / 2 - popoverRect.height / 2;

  if (left + popoverRect.width > vw - VIEWPORT_PADDING) {
    left = anchorRect.left - GAP - popoverRect.width;
  }

  if (top + popoverRect.height > vh - VIEWPORT_PADDING) {
    top = anchorRect.top - GAP - popoverRect.height;
  }

  if (top < VIEWPORT_PADDING) {
    top = anchorRect.bottom + GAP;
  }

  left = Math.max(
    VIEWPORT_PADDING,
    Math.min(left, vw - popoverRect.width - VIEWPORT_PADDING),
  );
  top = Math.max(
    VIEWPORT_PADDING,
    Math.min(top, vh - popoverRect.height - VIEWPORT_PADDING),
  );

  return { top, left };
}

export type HotspotProductPopoverProps = {
  hotspot: Hotspot;
  product?: Product;
  anchorEl: HTMLElement | null;
  onClose: () => void;
};

/**
 * Поповер товара по клику на hotspot-маркер (portal + viewport flip).
 */
export function HotspotProductPopover({
  hotspot,
  product,
  anchorEl,
  onClose,
}: HotspotProductPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

  const imageUrl =
    product?.images[0]?.url ?? hotspot.product.image ?? undefined;
  const title = product?.title ?? hotspot.product.name;
  const href = product ? productHref(product) : hotspot.product.slug;
  const showSale = product?.isOnSale && product.oldPrice;

  useLayoutEffect(() => {
    if (!anchorEl || !popoverRef.current) {
      setPosition(null);
      return;
    }

    const updatePosition = () => {
      if (!popoverRef.current || !anchorEl) return;
      const anchorRect = anchorEl.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      setPosition(computePopoverPosition(anchorRect, popoverRect));
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);

    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [anchorEl, hotspot.id]);

  if (!anchorEl || typeof document === "undefined") return null;

  return createPortal(
    <div
      ref={popoverRef}
      role="dialog"
      aria-label={`Товар ${hotspot.product.sku}`}
      className={cn(
        "fixed z-50 w-56 border border-border bg-background p-3 shadow-(--shadow-overlay)",
        !position && "invisible",
      )}
      style={
        position
          ? { top: position.top, left: position.left }
          : { top: 0, left: 0 }
      }
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
    </div>,
    document.body,
  );
}
