"use client";

import { Heart } from "lucide-react";

import {
  useIsFavorite,
  useToggleFavorite,
} from "@/lib/favorites/favorites-facade";
import { cn } from "@/lib/utils";

/** Тоггл избранного на карточке / PDP (auth → server, guest → local). */
export function FavoriteToggle({
  sku,
  productTitle,
  className,
}: {
  sku: string;
  productTitle: string;
  className?: string;
}) {
  const active = useIsFavorite(sku);
  const toggle = useToggleFavorite();

  return (
    <button
      type="button"
      aria-label={
        active
          ? `Убрать «${productTitle}» из избранного`
          : `Добавить «${productTitle}» в избранное`
      }
      aria-pressed={active}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(sku);
      }}
      className={cn(
        "inline-flex size-11 items-center justify-center rounded-sm bg-background/80 text-text-secondary backdrop-blur-sm transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        active && "text-brand",
        className,
      )}
    >
      <Heart className={cn("size-5", active && "fill-current")} />
    </button>
  );
}
