import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

import { getCategories } from "@/lib/api/endpoints";
import { staticBlurProps } from "@/lib/images";
import type { Category } from "@/lib/schemas";
import { catalogHref } from "@/lib/site";

/** Сколько плиток показываем — сетка 2×2 на весь экран. */
const TILE_COUNT = 4;

/**
 * Корневые категории по порядку сортировки.
 * Пока источник — каталог; настраиваемые слоты из админки придут позже
 * (`content_home_tiles`, HOME-001), fallback останется этот же.
 */
function pickTiles(categories: Category[]): Category[] {
  return categories
    .filter((c) => !c.parentSlug)
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .slice(0, TILE_COUNT);
}

/**
 * Мобильная главная: плитка 2×2 из категорий на весь экран,
 * сразу после первого баннера (макет `сайт_2.pdf`, HOME-001).
 * Заменяет рейл «Новинки» (M8-5). На десктопе не рендерится.
 */
export async function HomeCategoryTiles() {
  let tiles: Category[] = [];
  try {
    tiles = pickTiles(await getCategories());
  } catch (e) {
    console.error("[home-tiles]", e);
    return null;
  }

  if (tiles.length < TILE_COUNT) return null;

  return (
    <section
      aria-label="Категории каталога"
      className="grid h-[100svh] grid-cols-2 grid-rows-2 lg:hidden"
    >
      {tiles.map((tile, index) => (
        <Link
          key={tile.slug}
          href={catalogHref.top(tile.slug)}
          className="group relative isolate overflow-hidden bg-surface focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        >
          {tile.image ? (
            <Image
              src={tile.image.url}
              alt=""
              fill
              sizes="50vw"
              priority={index < 2}
              {...staticBlurProps()}
              className="object-cover"
            />
          ) : null}

          {/* Градиент сверху — подпись читается на любом кадре */}
          <span
            aria-hidden
            className="absolute inset-x-0 top-0 h-1/3 bg-linear-to-b from-black/45 to-transparent"
          />

          <span
            className={cn(
              "absolute right-4 left-4 z-10 text-[16px] leading-[22px] font-light text-text-inverse [text-shadow:0_1px_10px_rgba(0,0,0,0.45)]",
              // Верхний ряд уходит из-под прозрачной шапки (бургер + лого)
              index < 2
                ? "top-[calc(3.5rem+env(safe-area-inset-top,0px)+0.75rem)]"
                : "top-4",
            )}
          >
            {tile.title}
          </span>
        </Link>
      ))}
    </section>
  );
}
