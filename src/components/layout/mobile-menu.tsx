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
import { catalogHref, mainNav, siteContacts } from "@/lib/site";
import { taxonomy } from "@/lib/taxonomy";

/**
 * Мобильное меню через Sheet (boost shadcn/base-ui Dialog).
 * Каталог — Accordion с категориями/подкатегориями. Навигация закрывает меню.
 */
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        aria-label="Открыть меню"
        className="inline-flex size-10 items-center justify-center text-text-secondary transition-colors hover:text-text-heading focus-visible:ring-1 focus-visible:ring-ring focus-visible:outline-none lg:hidden"
      >
        <Menu className="size-6" />
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle className="font-display text-[22px] tracking-[0.18em] text-text-heading uppercase">
            MURU
          </SheetTitle>
        </SheetHeader>

        <nav aria-label="Основная навигация" className="flex flex-col gap-1">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={close}
              className="py-2 text-body text-text-primary transition-colors hover:text-brand"
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
            {taxonomy.map((top) => (
              <Accordion.Item
                key={top.slug}
                className="border-b border-border"
              >
                {top.children?.length ? (
                  <>
                    <Accordion.Header className="m-0">
                      <Accordion.Trigger className="group flex w-full items-center justify-between gap-2 py-3 text-body text-text-heading transition-colors hover:text-brand focus-visible:outline-none">
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
                    className="block py-3 text-body text-text-heading transition-colors hover:text-brand"
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
            href={siteContacts.phoneHref}
            className="font-medium text-text-primary transition-colors hover:text-brand"
          >
            {siteContacts.phoneDisplay}
          </a>
          <a
            href={siteContacts.emailHref}
            className="transition-colors hover:text-brand"
          >
            {siteContacts.email}
          </a>
          <p className="text-text-secondary">{siteContacts.hours}</p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
