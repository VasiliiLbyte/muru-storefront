"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { AuthSuccessToast } from "@/components/account/auth-success-toast";
import { HeaderAccount } from "@/components/layout/header-account";
import { HeaderMobileSearch } from "@/components/layout/header-search";
import { MiniCart } from "@/components/layout/mini-cart";
import { useFavoriteCount } from "@/stores/favorites-store";
import { cn } from "@/lib/utils";

const actionTriggerClass =
  "relative inline-flex flex-col items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:min-h-0 lg:min-w-[3.5rem] lg:w-auto lg:px-2 lg:gap-1";

const actionTriggerStyle = {
  width: 44,
  height: 44,
  minWidth: 44,
  minHeight: 44,
} as const;

const badgeClass =
  "absolute -top-0.5 -right-0.5 inline-flex min-w-5 items-center justify-center bg-brand px-1 text-[11px] leading-5 font-medium text-text-inverse lg:-top-1.5 lg:-right-2";

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
      <span className="relative inline-flex size-6 items-center justify-center">
        {children}
        {count ? (
          <span aria-hidden="true" className={badgeClass}>
            {count}
          </span>
        ) : null}
      </span>
      <span className="hidden text-[12px] leading-none text-text-secondary lg:block">
        {label}
      </span>
    </Link>
  );
}

export function HeaderActions({ className }: { className?: string }) {
  const favorites = useFavoriteCount();

  return (
    <div className={cn("flex items-center gap-0.5 sm:gap-1 lg:items-start lg:gap-8", className)}>
      {/* Mobile: search → account → favorites → cart (M8-8) */}
      <HeaderMobileSearch />
      <HeaderAccount />
      <AuthSuccessToast />
      <HeaderActionLink
        href="/personal/favorite/"
        label="Избранное"
        count={favorites}
      >
        <Heart className="size-5" />
      </HeaderActionLink>
      <MiniCart />
    </div>
  );
}

export { actionTriggerClass, badgeClass, actionTriggerStyle };
