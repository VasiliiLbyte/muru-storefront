"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { getCoverAspectRatio } from "@/lib/content/cover-aspect";
import type { Hotspot, Image as ContentImage, Product } from "@/lib/schemas";
import { cn } from "@/lib/utils";

import { HotspotProductPopover } from "./hotspot-product-popover";

export type LookbookHeroHotspotsProps = {
  cover: ContentImage;
  title: string;
  hotspots: Hotspot[];
  productsBySku: Record<string, Product>;
  className?: string;
};

/**
 * Hero-cover лукбука с hotspot-маркерами («+») и click-toggle поповером.
 */
export function LookbookHeroHotspots({
  cover,
  title,
  hotspots,
  productsBySku,
  className,
}: LookbookHeroHotspotsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleHotspot = useCallback((id: string) => {
    setActiveId((prev) => (prev === id ? null : id));
  }, []);

  const closePopover = useCallback(() => {
    setActiveId(null);
  }, []);

  useEffect(() => {
    if (!activeId) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closePopover();
    };

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (containerRef.current?.contains(target)) return;
      closePopover();
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [activeId, closePopover]);

  const activeHotspot = hotspots.find((h) => h.id === activeId);
  const coverWidth = cover.width ?? 1920;
  const coverHeight =
    cover.height ?? Math.round(coverWidth / getCoverAspectRatio(cover));

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative mb-10 w-full overflow-hidden bg-surface",
        className,
      )}
    >
      <Image
        src={cover.url}
        alt={cover.alt ?? title}
        width={coverWidth}
        height={coverHeight}
        sizes="(min-width: 1564px) 1564px, 100vw"
        priority
        placeholder={cover.blurDataURL ? "blur" : undefined}
        blurDataURL={cover.blurDataURL}
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
              type="button"
              aria-label={`Товар ${hotspot.product.sku}`}
              aria-expanded={isActive}
              onClick={() => toggleHotspot(hotspot.id)}
              className={cn(
                "flex size-9 items-center justify-center rounded-full border border-background/80 bg-brand text-lg leading-none text-text-inverse shadow-(--shadow-overlay) transition-transform motion-reduce:transition-none",
                "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:hover:scale-100",
                isActive && "scale-110 ring-2 ring-background motion-reduce:scale-100",
              )}
            >
              +
            </button>

            {isActive ? (
              <HotspotProductPopover
                hotspot={hotspot}
                product={productsBySku[hotspot.product.sku]}
                onClose={closePopover}
                className="absolute top-full left-1/2 mt-2 -translate-x-1/2 sm:left-full sm:top-1/2 sm:mt-0 sm:ml-2 sm:translate-x-0 sm:-translate-y-1/2"
              />
            ) : null}
          </div>
        );
      })}

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
