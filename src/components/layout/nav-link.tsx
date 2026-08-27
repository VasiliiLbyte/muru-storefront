"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/**
 * Ссылка верхнего меню с активным состоянием (aria-current).
 * Цвета по DESIGN.md: muted → primary на hover; активная — бренд.
 */
export function NavLink({
  href,
  children,
  className,
  onClick,
  accent = false,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  /** Brand on home (accent items) or when the link is the current page. */
  accent?: boolean;
}) {
  const pathname = usePathname();
  const isHome = pathname === "/" || pathname === "";
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const showBrand = accent ? isHome || isActive : isActive;

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "text-[14px] font-medium tracking-normal transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        showBrand
          ? "text-brand hover:text-brand"
          : "text-text-muted hover:text-text-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
