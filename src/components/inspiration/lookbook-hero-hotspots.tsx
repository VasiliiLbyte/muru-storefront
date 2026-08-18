"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

import { HotspotProductCard } from "@/components/inspiration/hotspot-product-card";
import { HotspotProductPopover } from "@/components/inspiration/hotspot-product-popover";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { useFineHover, useHotspotSheetMode } from "@/hooks/use-match-media";
import { getCoverAspectRatio } from "@/lib/content/cover-aspect";
import type { Hotspot, Image as ContentImage, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

const HOVER_CLOSE_DELAY_MS = 180;

export type LookbookHeroHotspotsProps = {
  banner: ContentImage;
  title: string;
  hotspots: Hotspot[];
  productsBySku: Record<string, Product>;
  className?: string;
};

/**
 * Hero-banner лукбука с hotspot-маркерами («+»):
 * hover-карточка на fine pointer, bottom-sheet на touch / <768px.
 */
export function LookbookHeroHotspots({
  banner,
  title,
  hotspots,
  productsBySku,
  className,
}: LookbookHeroHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const markerRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const closeTimerRef = useRef<number | null>(null);
  const isFineHover = useFineHover();
  const isHotspotSheet = useHotspotSheetMode();

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const openHotspot = useCallback((id: string) => {
    clearCloseTimer();
    setActiveId(id);
    setAnchorEl(markerRefs.current.get(id) ?? null);
  }, [clearCloseTimer]);

  const closePopover = useCallback(() => {
    clearCloseTimer();
    setActiveId(null);
    setAnchorEl(null);
  }, [clearCloseTimer]);

  const toggleHotspot = useCallback(
    (id: string) => {
      setActiveId((prev) => {
        const next = prev === id ? null : id;
        clearCloseTimer();
        setAnchorEl(next ? (markerRefs.current.get(next) ?? null) : null);
        return next;
      });
    },
    [clearCloseTimer],
  );

  const scheduleClose = useCallback(() => {
    if (!isFineHover) return;
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      closePopover();
    }, HOVER_CLOSE_DELAY_MS);
  }, [clearCloseTimer, closePopover, isFineHover]);

  useEffect(() => {
    return () => clearCloseTimer();
  }, [clearCloseTimer]);

  const prevMediaRef = useRef({
    isFineHover: false,
    isHotspotSheet: false,
  });
  useEffect(() => {
    const prev = prevMediaRef.current;
    const next = { isFineHover, isHotspotSheet };
    prevMediaRef.current = next;
    const wasSsrDefault = !prev.isFineHover && !prev.isHotspotSheet;
    if (wasSsrDefault) return;
    if (
      prev.isFineHover === next.isFineHover &&
      prev.isHotspotSheet === next.isHotspotSheet
    ) {
      return;
    }
    closePopover();
  }, [isFineHover, isHotspotSheet, closePopover]);

  useEffect(() => {
    if (!activeId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopover();
    };

    const onPointerDown = (event: PointerEvent) => {
      if (isHotspotSheet) return;
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      const popover = document.querySelector(
        '[role="dialog"][aria-label^="Товар"]',
      );
      if (popover?.contains(target)) return;
      closePopover();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeId, closePopover, isHotspotSheet]);

  const activeHotspot = hotspots.find((h) => h.id === activeId);
  const bannerWidth = banner.width ?? 1920;
  const bannerHeight =
    banner.height ?? Math.round(bannerWidth / getCoverAspectRatio(banner));
  const showPopover = Boolean(activeHotspot) && !isHotspotSheet;
  const showSheet = Boolean(activeHotspot) && isHotspotSheet;

  return (
    <div
      ref={containerRef}
      className={cn("relative mb-10 w-full bg-surface", className)}
    >
      <Image
        src={banner.url}
        alt={banner.alt ?? title}
        width={bannerWidth}
        height={bannerHeight}
        sizes="(min-width: 1564px) 1564px, 100vw"
        priority
        placeholder={banner.blurDataURL ? "blur" : undefined}
        blurDataURL={banner.blurDataURL}
        className="block h-auto w-full"
      />

      {hotspots.map((hotspot) => {
        const isActive = activeId === hotspot.id;

        return (
          <div
            key={hotspot.id}
            className="absolute z-10"
            style={{
              left: `${hotspot.xPercent}%`,
              top: `${hotspot.yPercent}%`,
              transform: "translate(-50%, -50%)",
            }}
          >
            <button
              ref={(el) => {
                if (el) markerRefs.current.set(hotspot.id, el);
                else markerRefs.current.delete(hotspot.id);
              }}
              type="button"
              aria-label={`Товар ${hotspot.product.sku}`}
              aria-expanded={isActive}
              onClick={() => toggleHotspot(hotspot.id)}
              onMouseEnter={() => {
                if (isFineHover) openHotspot(hotspot.id);
              }}
              onMouseLeave={() => {
                if (isFineHover) scheduleClose();
              }}
              className={cn(
                "relative flex size-7 items-center justify-center rounded-full border border-white/70 bg-white/25 text-lg leading-none text-white shadow-(--shadow-overlay) backdrop-blur-sm max-md:size-6 max-md:border-white/50 max-md:bg-white/10",
                "transition-transform motion-reduce:transition-none",
                "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:scale-100",
                isActive && "bg-white/40 ring-1 ring-white/80 max-md:bg-white/25",
              )}
            >
              {!isActive ? (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-full bg-white/25 animate-ping motion-reduce:animate-none max-md:bg-white/10"
                />
              ) : null}
              <span className="relative">+</span>
            </button>
          </div>
        );
      })}

      {showPopover && activeHotspot ? (
        <HotspotProductPopover
          hotspot={activeHotspot}
          product={productsBySku[activeHotspot.product.sku]}
          anchorEl={anchorEl}
          onClose={closePopover}
          onMouseEnter={clearCloseTimer}
          onMouseLeave={scheduleClose}
        />
      ) : null}

      {showSheet && activeHotspot ? (
        <Sheet
          open
          onOpenChange={(open) => {
            if (!open) closePopover();
          }}
        >
          <SheetContent
            side="bottom"
            showClose={false}
            className="gap-0 overflow-hidden rounded-t-2xl p-0"
          >
            <SheetTitle className="sr-only">
              {productsBySku[activeHotspot.product.sku]?.title ??
                activeHotspot.product.name}
            </SheetTitle>
            <SheetClose
              aria-label="Закрыть"
              className="absolute top-3 right-3 z-40 inline-flex size-10 items-center justify-center rounded-full bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <X className="size-5" />
            </SheetClose>
            <HotspotProductCard
              hotspot={activeHotspot}
              product={productsBySku[activeHotspot.product.sku]}
              imageSizes="100vw"
              layout="sheet"
            />
          </SheetContent>
        </Sheet>
      ) : null}

      {activeHotspot && (
        <button
          type="button"
          aria-hidden
          tabIndex={-1}
          className="absolute inset-0 z-[5] cursor-default bg-transparent"
          onClick={closePopover}
        />
      )}
    </div>
  );
}
