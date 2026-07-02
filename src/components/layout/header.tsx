import { catalogTriggerClass } from "@/components/layout/catalog-trigger-class";
import { siteContacts } from "@/lib/site";
import { Suspense } from "react";

import { CatalogMenu } from "./catalog-menu";
import { HeaderActions } from "./header-actions";
import { HeaderSearch } from "./header-search";
import { HeaderTopNav } from "./header-top-nav";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

function CatalogMenuFallback() {
  return <span className={catalogTriggerClass}>Каталог</span>;
}

/**
 * Двухстрочная шапка (~170px desktop): utility — прокручиваемый div;
 * нижний бар — семантический sticky header (containing block = body).
 */
export function Header() {
  return (
    <>
      {/* Utility-строка — desktop, уезжает при скролле */}
      <div className="hidden border-b border-border lg:block">
        <div className="mx-auto flex h-11 w-full max-w-[1564px] items-center justify-between px-4 sm:px-8">
          <HeaderTopNav />
          <a
            href={siteContacts.phoneHref}
            className="text-body font-light text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
          >
            {siteContacts.phoneDisplay}
          </a>
        </div>
      </div>

      {/* Нижний бар — sticky на всю страницу (containing block = body) */}
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-[1564px] px-4 sm:px-8">
          <div className="flex flex-col gap-3 py-4 lg:min-h-[calc(var(--header-height)-2.75rem)] lg:flex-row lg:items-center lg:gap-4 lg:py-6">
            <div className="flex items-center gap-3 lg:gap-4">
              <div className="lg:hidden">
                <MobileMenu />
              </div>
              <Logo className="shrink-0" />
              <div className="hidden lg:block">
                <Suspense fallback={<CatalogMenuFallback />}>
                  <CatalogMenu />
                </Suspense>
              </div>
              <div className="ml-auto flex lg:hidden">
                <HeaderActions compact />
              </div>
            </div>

            <HeaderSearch className="w-full lg:flex-1" />

            <div className="hidden lg:flex">
              <HeaderActions />
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
