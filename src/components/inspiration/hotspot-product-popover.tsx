"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { Hotspot, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { HotspotProductCard } from "./hotspot-product-card";

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
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
};

/**
 * Поповер товара по клику/hover на hotspot-маркер (portal + viewport flip).
 */
export function HotspotProductPopover({
  hotspot,
  product,
  anchorEl,
  onClose,
  onMouseEnter,
  onMouseLeave,
}: HotspotProductPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<PopoverPosition | null>(null);

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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
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

      <HotspotProductCard hotspot={hotspot} product={product} />
    </div>,
    document.body,
  );
}
