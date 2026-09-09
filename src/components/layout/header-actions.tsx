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

const actionTriggerStyle = {
  width: 44,
  height: 44,
  minWidth: 44,
  minHeight: 44,
} as const;

/**
 * Единый размер глифа для всей шапки: 16px на мобиле (на 20% меньше
 * прежних 20px — на телефоне иконки были слишком крупными) и 20px от `lg`.
 * Бокс совпадает с глифом, поэтому счётчик садится на угол самой иконки.
 */
const actionGlyphClass = "size-4 lg:size-5";

const actionIconBoxClass =
  "relative inline-flex size-4 items-center justify-center lg:size-5";

/**
 * Лупа — замкнутое кольцо во всю сетку 26×26, поэтому при одинаковом боксе
 * она читается крупнее сердца и корзины. На мобиле гасим это оптически:
 * 14px вместо 16px.
 */
const actionGlyphSearchClass = "size-[14px] lg:size-5";

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
  actionGlyphSearchClass,
  actionIconBoxClass,
  badgeClass,
  actionTriggerStyle,
};
