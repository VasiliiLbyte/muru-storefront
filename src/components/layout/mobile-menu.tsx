"use client";

import { useState } from "react";
import Link from "next/link";
import { Accordion } from "@base-ui/react/accordion";
import { ChevronDown, Menu } from "lucide-react";


import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { CatalogNavNode } from "@/lib/catalog/catalog-nav";
import { toSentenceCaseRu } from "@/lib/content/breadcrumbs";
import { catalogHref, mainNav, type SiteContacts } from "@/lib/site";

import { Logo } from "./logo";
import { SiteMenuDesktop } from "./site-menu-desktop";

/**
 * Мобильное меню через Sheet (boost shadcn/base-ui Dialog).
 * Каталог — Accordion из API / MSW.
 */
export function MobileMenu({
  contacts,
  catalogTree,
}: {
  contacts: SiteContacts;
  catalogTree: CatalogNavNode[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Открыть меню"
        data-menu-trigger
        className="inline-flex items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none"
        style={{ width: 44, height: 44, minWidth: 44, minHeight: 44 }}
      >
        <Menu className="size-5" strokeWidth={1.5} />
      </SheetTrigger>
      <SheetContent
        side="left"
        onSwipeClose={close}
        className="gap-3 bg-white p-4 lg:w-[52vw] lg:max-w-[820px] lg:gap-8 lg:p-10"
      >
        <SheetHeader>
          <SheetTitle className="sr-only">Меню</SheetTitle>
          <div onClick={close}>
            <Logo className="[&_img]:h-6 [&_img]:w-auto" />
          </div>
        </SheetHeader>

        {/* Десктоп — две колонки по макету дизайнера */}
        <SiteMenuDesktop catalogTree={catalogTree} onNavigate={close} />

        <div className="mb-6 lg:hidden">
          <p className="mb-1 text-[17px] leading-6 font-light tracking-wide text-text-secondary uppercase">
            Каталог
          </p>
          <Accordion.Root className="flex flex-col">
            {catalogTree.map((top) => (
              <Accordion.Item
                key={top.slug}
              >
                {top.children?.length ? (
                  <>
                    <Accordion.Header className="m-0">
                      <Accordion.Trigger className="group flex min-h-9 w-full items-center justify-between gap-2 py-2 text-body text-text-heading transition-colors hover:text-brand focus-visible:outline-none">
                        {toSentenceCaseRu(top.title)}
                        <ChevronDown className="size-4 transition-transform duration-300 ease-in-out group-data-[panel-open]:rotate-180 motion-reduce:transition-none motion-reduce:group-data-[panel-open]:rotate-0" />
                      </Accordion.Trigger>
                    </Accordion.Header>
                    <Accordion.Panel className="overflow-hidden">
                      <ul className="flex flex-col gap-0.5 pb-2 pl-3">
                        <li>
                          <Link
                            href={catalogHref.top(top.slug)}
                            onClick={close}
                            className="block py-1 text-small font-light text-text-primary transition-colors hover:text-brand"
                          >
                            Все: {toSentenceCaseRu(top.title)}
                          </Link>
                        </li>
                        {top.children.map((sub) => (
                          <li key={sub.slug}>
                            <Link
                              href={catalogHref.sub(top.slug, sub.slug)}
                              onClick={close}
                              className="block py-1 text-small font-light text-text-secondary transition-colors hover:text-text-primary"
                            >
                              {toSentenceCaseRu(sub.title)}
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
                    className="block min-h-9 py-2 text-body text-text-heading transition-colors hover:text-brand"
                  >
                    {toSentenceCaseRu(top.title)}
                  </Link>
                )}
              </Accordion.Item>
            ))}
          </Accordion.Root>
        </div>

        <nav aria-label="Основная навигация" className="flex flex-col gap-0.5 lg:hidden">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="min-h-9 py-1 text-[17px] leading-6 font-light text-text-primary uppercase transition-colors hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="mt-auto flex flex-col gap-1 pt-4 text-small text-text-secondary lg:hidden">
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
