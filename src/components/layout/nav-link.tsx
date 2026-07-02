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
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      onClick={onClick}
      className={cn(
        "text-caption font-medium tracking-wide transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
        isActive ? "text-brand" : "text-text-muted hover:text-text-primary",
        className,
      )}
    >
      {children}
    </Link>
  );
}
