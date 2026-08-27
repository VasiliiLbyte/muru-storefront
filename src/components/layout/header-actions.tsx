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

/** 44×44 hit target on mobile; icon-only natural size on lg+. */
const actionTriggerClass =
  "relative inline-flex items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none max-lg:size-11 max-lg:min-h-11 max-lg:min-w-11 lg:size-auto lg:min-h-0 lg:min-w-0";

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
    >
      <span className="relative inline-flex size-6 items-center justify-center">
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
      className={cn(
        "flex items-center gap-0.5 sm:gap-1",
        "lg:grid lg:w-[18.75rem] lg:grid-cols-3 lg:items-center lg:justify-items-center lg:gap-0",
        className,
      )}
    >
      {/* Mobile: search → account → favorites → cart (M8-8) */}
      <HeaderMobileSearch />
      <HeaderAccount />
      <AuthSuccessToast />
      <AddedToCartToast />
      <HeaderActionLink
        href="/personal/favorite/"
        label="Избранное"
        count={favorites}
      >
        <IconFavorites className="size-5" />
      </HeaderActionLink>
      <MiniCart className="lg:justify-self-end" />
    </div>
  );
}

export { actionTriggerClass, badgeClass };
