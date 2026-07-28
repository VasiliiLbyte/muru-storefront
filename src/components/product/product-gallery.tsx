"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";

import type { Image as ImageData } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  title,
}: {
  images: ImageData[];
  title: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const active = images[activeIndex] ?? images[0];

  const updateActiveFromScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || el.clientWidth === 0) return;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    setActiveIndex(Math.min(Math.max(index, 0), images.length - 1));
  }, [images.length]);

  if (!active) {
    return (
      <div className="relative aspect-square w-full bg-surface" aria-hidden="true" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Mobile: horizontal snap carousel */}
      <div className="relative lg:hidden">
        <div
          ref={scrollRef}
          onScroll={updateActiveFromScroll}
          className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label={`Галерея: изображение ${activeIndex + 1} из ${images.length}`}
        >
          {images.map((image, index) => (
            <div
              key={`${image.url}-${index}`}
              className="relative aspect-square min-w-full shrink-0 snap-center overflow-hidden bg-surface"
            >
              <Image
                src={image.url}
                alt={image.alt ?? title}
                fill
                priority={index === 0}
                sizes="100vw"
                placeholder={image.blurDataURL ? "blur" : undefined}
                blurDataURL={image.blurDataURL}
                className="object-cover"
              />
            </div>
          ))}
        </div>
        {images.length > 1 ? (
          <div
            className="mt-3 flex items-center justify-center gap-2"
            aria-hidden
          >
            <div className="flex gap-1.5">
              {images.map((image, index) => (
                <span
                  key={`dot-${image.url}-${index}`}
                  className={cn(
                    "size-1.5 rounded-full transition-colors",
                    index === activeIndex ? "bg-brand" : "bg-brand/35",
                  )}
                />
              ))}
            </div>
            <span className="text-caption text-text-secondary">
              {activeIndex + 1}/{images.length}
            </span>
          </div>
        ) : null}
      </div>

      {/* Desktop: main + thumbs */}
      <div
        id="product-gallery-main"
        role="tabpanel"
        aria-labelledby={`product-gallery-tab-${activeIndex}`}
        className="relative hidden aspect-square w-full overflow-hidden bg-surface lg:block"
      >
        <Image
          src={active.url}
          alt={active.alt ?? title}
          fill
          priority={activeIndex === 0}
          sizes="(min-width: 1024px) 50vw, 100vw"
          placeholder={active.blurDataURL ? "blur" : undefined}
          blurDataURL={active.blurDataURL}
          className="object-cover"
        />
      </div>

      {images.length > 1 ? (
        <div
          className="hidden flex-wrap gap-2 lg:flex"
          role="tablist"
          aria-label="Миниатюры изображений"
        >
          {images.map((image, index) => {
            const selected = index === activeIndex;
            return (
              <button
                key={`${image.url}-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-controls="product-gallery-main"
                id={`product-gallery-tab-${index}`}
                aria-label={`Изображение ${index + 1} из ${images.length}`}
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "relative size-16 overflow-hidden border bg-surface transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none sm:size-20",
                  selected
                    ? "border-brand"
                    : "border-border hover:border-brand-hover",
                )}
              >
                <Image
                  src={image.url}
                  alt=""
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
