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
        <div className="grid gap-10 lg:grid-cols-[220px_minmax(0,1fr)]">
          <nav aria-label="Разделы кабинета" className="flex flex-col gap-1">
            {NAV.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/account/" && pathname?.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-2 text-body transition-colors focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none",
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
              className="mt-4 justify-start px-3 text-text-secondary"
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
