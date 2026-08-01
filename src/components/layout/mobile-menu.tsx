"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown, Heart, LogOut, Menu, ShoppingBag, User } from "lucide-react";

import { openLoginDialog } from "@/components/account/login-dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { logoutCustomer } from "@/lib/account/logout";
import { getCategories } from "@/lib/api/endpoints";
import {
  categoriesToNavTree,
  type CatalogNavNode,
} from "@/lib/catalog/catalog-nav";
import { catalogHref, mainNav, type SiteContacts } from "@/lib/site";
import { useCartCount } from "@/stores/cart-store";
import {
  customerFirstName,
  useCustomerSessionCustomer,
  useCustomerSessionStatus,
} from "@/stores/customer-session-store";
import { useFavoriteCount } from "@/stores/favorites-store";

/**
 * Мобильное меню через Sheet (boost shadcn/base-ui Dialog).
 * Каталог — Accordion из API / MSW.
 */
export function MobileMenu({ contacts }: { contacts: SiteContacts }) {
  const [open, setOpen] = useState(false);
  const [catalogTree, setCatalogTree] = useState<CatalogNavNode[]>([]);
  const close = () => setOpen(false);
  const status = useCustomerSessionStatus();
  const customer = useCustomerSessionCustomer();
  const favorites = useFavoriteCount();
  const cartCount = useCartCount();
  const firstName = customerFirstName(customer?.fullName ?? "");

  useEffect(() => {
    let cancelled = false;
    getCategories()
      .then((cats) => {
        if (!cancelled) setCatalogTree(categoriesToNavTree(cats));
      })
      .catch((err) => {
        console.warn("[mobile-menu] categories fetch failed", err);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function handleLogin() {
    close();
    // Defer so Sheet unmounts before login Dialog opens (z-index stack).
    window.setTimeout(() => openLoginDialog(), 0);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Открыть меню"
        className="inline-flex items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="left" className="bg-background">
        <SheetHeader>
          <SheetTitle className="font-display text-[22px] tracking-[0.18em] text-text-heading uppercase">
            MURU
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 border-b border-border pb-4">
          {status === "authenticated" ? (
            <>
              <p className="text-body text-text-heading">
                {firstName || "Аккаунт"}
              </p>
              <Link
                href="/account/"
                onClick={close}
                className="inline-flex min-h-11 items-center gap-2 text-body text-text-primary transition-colors hover:text-brand"
              >
                <User className="size-5 shrink-0" aria-hidden />
                Личный кабинет
              </Link>
              <button
                type="button"
                onClick={() => {
                  close();
                  void logoutCustomer();
                }}
                className="inline-flex min-h-11 items-center gap-2 text-left text-body text-text-secondary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
              >
                <LogOut className="size-5 shrink-0" aria-hidden />
                Выйти
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={handleLogin}
              className="inline-flex min-h-11 items-center gap-2 text-left text-body text-text-primary transition-colors hover:text-brand focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
            >
              <User className="size-5 shrink-0" aria-hidden />
              Войти
            </button>
          )}

          <Link
            href="/personal/favorite/"
            onClick={close}
            className="inline-flex min-h-11 items-center justify-between gap-2 text-body text-text-primary transition-colors hover:text-brand"
          >
            <span className="inline-flex items-center gap-2">
              <Heart className="size-5 shrink-0" aria-hidden />
              Избранное
            </span>
            {favorites > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center bg-brand px-1.5 text-[11px] leading-5 font-medium text-text-inverse">
                {favorites}
              </span>
            ) : null}
          </Link>
          <Link
            href="/basket/"
            onClick={close}
            className="inline-flex min-h-11 items-center justify-between gap-2 text-body text-text-primary transition-colors hover:text-brand"
          >
            <span className="inline-flex items-center gap-2">
              <ShoppingBag className="size-5 shrink-0" aria-hidden />
              Корзина
            </span>
            {cartCount > 0 ? (
              <span className="inline-flex min-w-5 items-center justify-center bg-brand px-1.5 text-[11px] leading-5 font-medium text-text-inverse">
                {cartCount}
              </span>
            ) : null}
          </Link>
        </div>

        <nav aria-label="Основная навигация" className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
          className="min-h-11 py-2 text-body text-text-primary uppercase transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div>
          <p className="mb-2 text-caption font-medium tracking-wide text-text-secondary uppercase">
            Каталог
          </p>
          <Accordion.Root className="flex flex-col">
            {catalogTree.map((top) => (
              <Accordion.Item
                key={top.slug}
                className="border-b border-border"
              >
                {top.children?.length ? (
                  <>
                    <Accordion.Header className="m-0">
                      <Accordion.Trigger className="group flex min-h-11 w-full items-center justify-between gap-2 py-3 text-body text-text-heading transition-colors hover:text-brand focus-visible:outline-none">
                        {top.title}
                        <ChevronDown className="size-4 transition-transform duration-300 ease-in-out group-data-[panel-open]:rotate-180 motion-reduce:transition-none motion-reduce:group-data-[panel-open]:rotate-0" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className="overflow-hidden">
                      <ul className="flex flex-col gap-1 pb-3 pl-3">
                        <li>
                          <Link
                            href={catalogHref.top(top.slug)}
                            onClick={close}
                            className="block py-1.5 text-small text-text-primary transition-colors hover:text-brand"
                          >
                            Все: {top.title}
                          </Link>
                        </li>
                        {top.children.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={catalogHref.sub(top.slug, sub.slug)}
                              onClick={close}
                              className="block py-1.5 text-small text-text-secondary transition-colors hover:text-text-primary"
                            >
                              {sub.title}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </Accordion.Panel>
                  </>
                ) : (
                  <Link
                    href={catalogHref.top(top.slug)}
                    onClick={close}
                    className="block min-h-11 py-3 text-body text-text-heading transition-colors hover:text-brand"
                  >
                    {top.title}
                  </Link>
                )}
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>

        <div className="mt-auto flex flex-col gap-1 border-t border-border pt-4 text-small text-text-secondary">
          <a
            href={contacts.phoneHref}
            className="font-medium text-text-primary transition-colors hover:text-brand"
          >
            {contacts.phoneDisplay}
          </a>
          <a
            href={contacts.emailHref}
            className="transition-colors hover:text-brand"
          >
            {contacts.email}
          </a>
          <p className="text-text-secondary">{contacts.hours}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
