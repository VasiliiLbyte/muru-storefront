"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ContentShell } from "@/components/content/content-shell";
import { Button } from "@/components/ui/button";
import { logoutCustomer } from "@/lib/account/logout";
import { contentBreadcrumbs } from "@/lib/content/breadcrumbs";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/account/", label: "Обзор" },
  { href: "/account/personal/", label: "Персональные данные" },
  { href: "/account/orders/", label: "Заказы" },
  { href: "/account/favorites/", label: "Избранное" },
  { href: "/account/addresses/", label: "Адреса" },
] as const;

export function AccountShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  const pathname = usePathname();

  return (
    <main id="main" className="flex flex-1 flex-col">
      <ContentShell
        title={title}
        breadcrumbs={contentBreadcrumbs({
          name: "Личный кабинет",
          href: "/account/",
        })}
      >
        <div className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-10">
          <nav
            aria-label="Разделы кабинета"
            className={cn(
              "flex gap-1",
              // Mobile: horizontal scroll
              "max-lg:-mx-4 max-lg:flex-nowrap max-lg:overflow-x-auto max-lg:px-4 max-lg:[scrollbar-width:none] max-lg:[&::-webkit-scrollbar]:hidden",
              // Desktop: vertical
              "lg:flex-col",
            )}
          >
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/account/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex min-h-11 shrink-0 items-center px-3 py-2 text-body transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
                    active
                      ? "bg-surface text-text-heading"
                      : "text-text-secondary hover:text-text-heading",
                  )}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
            <Button
              type="button"
              variant="ghost"
              className="mt-0 min-h-11 shrink-0 justify-start px-3 text-text-secondary lg:mt-4"
              onClick={() => void logoutCustomer()}
            >
              Выйти
            </Button>
          </nav>
          <div className="min-w-0">{children}</div>
        </div>
      </ContentShell>
    </main>
  );
}
