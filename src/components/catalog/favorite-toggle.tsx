"use client";

import { IconFavorites, IconFavoritesFilled } from "@/components/icons";
import {
  useIsFavorite,
  useToggleFavorite,
} from "@/lib/favorites/favorites-facade";
import { cn } from "@/lib/utils";

export type FavoriteToggleVariant = "plaque" | "bare";

/**
 * Тоггл избранного на карточке / PDP (auth → server, guest → local).
 *
 * `plaque` — с полупрозрачной подложкой (PDP, оверлеи на светлом).
 * `bare` — без фона, контурная иконка поверх фото (сетка каталога,
 * макет `сайт_2.pdf` / CARD-001). Хит-таргет 44×44 в обоих вариантах.
 */
export function FavoriteToggle({
  sku,
  productTitle,
  variant = "plaque",
  className,
}: {
  sku: string;
  productTitle: string;
  variant?: FavoriteToggleVariant;
  className?: string;
}) {
  const active = useIsFavorite(sku);
  const toggle = useToggleFavorite();
  const isBare = variant === "bare";

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
        "inline-flex size-11 items-center justify-center transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        isBare
          ? "text-text-heading [filter:drop-shadow(0_0_2px_rgb(255_255_255_/_0.9))_drop-shadow(0_1px_5px_rgb(255_255_255_/_0.75))] hover:text-brand"
          : "rounded-sm bg-background/80 text-text-secondary backdrop-blur-sm hover:text-brand",
        active && "text-brand",
        className,
      )}
    >
      {active ? (
        <IconFavoritesFilled
          className={isBare ? "size-[22px]" : "size-5"}
          aria-hidden
        />
      ) : (
        <IconFavorites
          className={isBare ? "size-[22px]" : "size-5"}
          aria-hidden
        />
      )}
    </button>
  );
}
