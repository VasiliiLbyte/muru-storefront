import Link from "next/link";

import { getCategories } from "@/lib/api/endpoints";
import { Logo } from "./logo";
import {
  catalogHref,
  companyLinks,
  legalNav,
  type NavItem,
  type SiteContacts,
} from "@/lib/site";
import { cn } from "@/lib/utils";

const companyLinkClass = cn(
  "inline-flex min-h-11 items-center font-light text-text-secondary transition-colors hover:text-brand",
  "max-lg:text-[16px] max-lg:leading-5 max-lg:uppercase",
  "lg:text-body lg:uppercase",
);

const catalogLinkClass = cn(
  "inline-flex min-h-11 items-center font-light text-text-secondary transition-colors hover:text-brand",
  "max-lg:text-[16px] max-lg:leading-5 max-lg:uppercase",
  "lg:text-body",
);

const columnHeadingClass =
  "mb-3 text-small font-medium tracking-[0.08em] text-text-heading uppercase";

/**
 * Подвал ≈ old.bitrix: watermark logo, 3 колонки, копирайт + legal.
 * Каталог — топ-категории из API (или MSW-фикстур).
 */
export async function Footer({ contacts }: { contacts: SiteContacts }) {
  const year = new Date().getFullYear();

  let catalogLinks: NavItem[] = [];
  try {
    catalogLinks = (await getCategories())
      .filter((c) => !c.parentSlug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({ label: c.title, href: catalogHref.top(c.slug) }));
  } catch (err) {
    console.warn("[footer] categories fetch failed", err);
  }

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1564px] px-4 py-12 sm:px-8">
        <div className="mb-10 flex justify-center">
          <Logo className="h-auto [&_img]:h-8 [&_img]:w-auto sm:[&_img]:h-12 sm:opacity-70 lg:[&_img]:h-14" />
        </div>

        <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8">
          <nav aria-label="Компания">
            <p className={columnHeadingClass}>Компания</p>
            <ul className="flex flex-col gap-y-0.5">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={companyLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Каталог">
            <p className={columnHeadingClass}>Каталог</p>
            <ul className="flex flex-col gap-y-0.5">
              {catalogLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={catalogLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <address
            aria-label="Контакты"
            className="flex flex-col gap-1 text-small text-text-secondary not-italic"
          >
            <p className={columnHeadingClass}>Контакты</p>
            <span className="py-2">{contacts.address}</span>
            <a
              href={contacts.phoneHref}
              className="inline-flex min-h-11 items-center font-medium text-text-primary transition-colors hover:text-brand"
            >
              {contacts.phoneDisplay}
            </a>
            <a
              href={contacts.emailHref}
              className="inline-flex min-h-11 items-center transition-colors hover:text-brand"
            >
              {contacts.email}
            </a>
            <span className="py-2 text-text-secondary">{contacts.hours}</span>
          </address>
        </div>

        <div className="mt-10 flex flex-col gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-small text-text-secondary">© {year} MURU</p>
          <ul className="flex flex-wrap gap-x-6 gap-y-1">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center text-small text-text-secondary transition-colors hover:text-text-primary"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
