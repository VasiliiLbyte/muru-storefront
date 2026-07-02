"use client";

import Image from "next/image";
import { useState } from "react";

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
  const active = images[activeIndex] ?? images[0];

  if (!active) {
    return (
      <div className="relative aspect-[4/5] w-full bg-surface" aria-hidden="true" />
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div
        id="product-gallery-main"
        role="tabpanel"
        aria-labelledby={`product-gallery-tab-${activeIndex}`}
        className="relative aspect-[4/5] w-full overflow-hidden bg-surface"
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
          className="flex flex-wrap gap-2"
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
