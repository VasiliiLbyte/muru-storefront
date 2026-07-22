"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

import { AuthSuccessToast } from "@/components/account/auth-success-toast";
import { HeaderAccount } from "@/components/layout/header-account";
import { MiniCart } from "@/components/layout/mini-cart";
import { useFavoriteCount } from "@/stores/favorites-store";
import { cn } from "@/lib/utils";

function HeaderActionLink({
  href,
  label,
  count,
  children,
  compact,
}: {
  href: string;
  label: string;
  count?: number;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={count ? `${label} (${count})` : label}
      className={cn(
        "relative flex flex-col items-center gap-1 text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        compact ? "min-w-10 px-1" : "min-w-[3.5rem] px-2",
      )}
    >
      <span className="relative inline-flex size-6 items-center justify-center">
        {children}
        {count ? (
          <span
            aria-hidden="true"
            className="absolute -top-1.5 -right-2 inline-flex min-w-4 items-center justify-center bg-brand px-1 text-[10px] leading-4 font-medium text-text-inverse"
          >
            {count}
          </span>
        ) : null}
      </span>
      {!compact ? (
        <span className="text-[12px] leading-none text-text-secondary">{label}</span>
      ) : null}
    </Link>
  );
}

export function HeaderActions({
  className,
  compact = false,
}: {
  className?: string;
  compact?: boolean;
}) {
  const favorites = useFavoriteCount();

  return (
    <div className={cn("flex items-start gap-1 sm:gap-2 lg:gap-8", className)}>
      <HeaderAccount compact={compact} />
      <AuthSuccessToast />
      <HeaderActionLink
        href="/personal/favorite/"
        label="Избранное"
        count={favorites}
        compact={compact}
      >
        <Heart className="size-5" />
      </HeaderActionLink>
      <MiniCart compact={compact} />
    </div>
  );
}
