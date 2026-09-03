import { catalogTriggerClass } from "@/components/layout/catalog-trigger-class";
import type { SiteContacts } from "@/lib/site";
import { Suspense } from "react";

import { CatalogMenu } from "./catalog-menu";
import { HeaderActions } from "./header-actions";
import { HeaderSearch } from "./header-search";
import { HeaderTopNav } from "./header-top-nav";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";
import { FavoritesSessionBridge } from "@/components/favorites/favorites-session-bridge";
import { cn } from "@/lib/utils";

const headerGridClass = "mx-auto w-full max-w-[1564px] px-4 sm:px-8";

function CatalogMenuFallback() {
  return <span className={catalogTriggerClass}>Каталог</span>;
}

/**
 * Utility-строка (desktop) + sticky нижний бар.
 * &lt;lg: одна строка ~60px — бургер | лого | поиск-иконка | actions.
 * ≥lg: лого | каталог | инлайн-поиск | actions (без регрессий).
 */
export function Header({ contacts }: { contacts: SiteContacts }) {
  return (
    <>
      <FavoritesSessionBridge />
      {/* Utility-строка — desktop, уезжает при скролле */}
      <div data-header-utility className="home-snap-origin hidden lg:block">
        <div className={cn(headerGridClass, "flex h-11 items-center justify-between")}>
          <HeaderTopNav />
          <a
            href={contacts.phoneHref}
            className="text-body font-light text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {contacts.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Нижний бар — sticky на всю страницу (containing block = body) */}
      <header
        data-app-header
        className="sticky top-0 z-40 bg-background/95 pt-safe-header backdrop-blur supports-[backdrop-filter]:bg-background/80"
      >
        <div className={headerGridClass}>
          <div
            data-header-bar
            className="flex h-14 items-center gap-2 lg:min-h-[calc(var(--header-height)-2.75rem)] lg:gap-4 lg:py-2"
          >
            <div data-header-burger className="lg:hidden">
              <MobileMenu contacts={contacts} />
            </div>

            <Logo
              className="min-w-0 max-w-[4.5rem] shrink lg:max-w-none lg:shrink-0 [&_img]:h-5 [&_img]:w-auto lg:[&_img]:h-10"
            />

            <div data-header-catalog className="hidden lg:block">
              <Suspense fallback={<CatalogMenuFallback />}>
                <CatalogMenu />
              </Suspense>
            </div>

            <HeaderSearch className="lg:flex-1" />

            <HeaderActions className="ml-auto shrink-0 lg:ml-0" />
          </div>
        </div>
      </header>
    </>
  );
}
