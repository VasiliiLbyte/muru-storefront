"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { IconFavorites } from "@/components/icons";

import { AuthSuccessToast } from "@/components/account/auth-success-toast";
import { AddedToCartToast } from "@/components/cart/added-to-cart-toast";
import { HeaderAccount } from "@/components/layout/header-account";
import { HeaderMobileSearch } from "@/components/layout/header-search";
import { MiniCart } from "@/components/layout/mini-cart";
import { useFavoriteCount } from "@/lib/favorites/favorites-facade";
import { cn } from "@/lib/utils";

const actionTriggerClass =
  "relative inline-flex flex-col items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:min-h-0 lg:min-w-0 lg:w-auto lg:gap-1 lg:!min-w-0 lg:!w-auto lg:!h-auto";

/**
 * Хит-таргет иконки. Ширина 40 (не 44): при 21px глифе и целом логотипе
 * пять кнопок + вордмарк иначе не помещаются в 358px мобильной шапки.
 * Высота остаётся 44.
 */
const actionTriggerStyle = {
  width: 40,
  height: 44,
  minWidth: 40,
  minHeight: 44,
} as const;

/**
 * Единый размер глифа для всей шапки. На мобиле 21px — ровно видимая высота
 * вордмарка MURU при боксе логотипа 24px (ink = 175/199 бокса), чтобы иконки
 * и логотип стояли вровень по высоте. От `lg` — прежние 20px.
 * Бокс совпадает с глифом, поэтому счётчик садится на угол самой иконки.
 */
const actionGlyphClass = "size-[21px] lg:size-5";

const actionIconBoxClass =
  "relative inline-flex size-[21px] items-center justify-center lg:size-5";

const badgeClass =
  "absolute -top-1 -right-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-brand px-0.5 text-[10px] leading-none font-medium text-text-inverse";

function HeaderActionLink({
  href,
  label,
  count,
  children,
}: {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      className={actionTriggerClass}
      style={actionTriggerStyle}
    >
      <span className={actionIconBoxClass}>
        {children}
        {count ? (
          <span aria-hidden="true" className={badgeClass}>
            {count}
          </span>
        ) : null}
      </span>
    </Link>
  );
}

export function HeaderActions({ className }: { className?: string }) {
  const favorites = useFavoriteCount();

  return (
    <div
      data-header-actions
      className={cn("flex items-center gap-0.5 sm:gap-1 lg:items-center lg:gap-5 lg:pr-0", className)}
    >
      {/* Порядок по макету `сайт_2.pdf`: поиск → избранное → ЛК → корзина.
          Одинаков на мобиле и десктопе (заменяет порядок из M8-8). */}
      <HeaderMobileSearch />
      <HeaderActionLink
        href="/personal/favorite/"
        label="Избранное"
        count={favorites}
      >
        <IconFavorites className={actionGlyphClass} />
      </HeaderActionLink>
      <HeaderAccount />
      <MiniCart />
      <AuthSuccessToast />
      <AddedToCartToast />
    </div>
  );
}

export {
  actionTriggerClass,
  actionGlyphClass,
  actionIconBoxClass,
  badgeClass,
  actionTriggerStyle,
};
