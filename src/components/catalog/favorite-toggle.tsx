"use client";

import { IconFavorites, IconFavoritesFilled } from "@/components/icons";
import {
  useIsFavorite,
  useToggleFavorite,
} from "@/lib/favorites/favorites-facade";
import { cn } from "@/lib/utils";

export type FavoriteToggleVariant = "plaque" | "bare";

/** Глиф на карточке: 21px на мобиле (вровень с иконками шапки), 22px от `lg`. */
export const cardGlyphClass = "size-[21px] lg:size-[22px]";

/**
 * Тоггл избранного на карточке / PDP (auth → server, guest → local).
 *
 * `plaque` — с полупрозрачной подложкой (PDP, оверлеи на светлом).
 * `bare` — без фона, белая контурная иконка поверх фото (сетка каталога,
 * макет `сайт_2.pdf` / CARD-001). Белая, а не серая: чисто белых кадров в
 * каталоге нет, а на тёмных фото серый контур пропадал; тень держит глиф
 * читаемым и на светлых кадрах. Хит-таргет 44×44 в обоих вариантах.
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
          ? "text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.05)] hover:text-brand"
          : cn(
              "rounded-sm bg-background/80 text-text-secondary backdrop-blur-sm hover:text-brand",
              active && "text-brand",
            ),
        className,
      )}
    >
      {active ? (
        <IconFavoritesFilled
          className={isBare ? cardGlyphClass : "size-5"}
          aria-hidden
        />
      ) : (
        <IconFavorites
          className={isBare ? cardGlyphClass : "size-5"}
          aria-hidden
        />
      )}
    </button>
  );
}
