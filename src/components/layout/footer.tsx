import Link from "next/link";

import { Logo } from "./logo";
import { catalogLinks, companyLinks, legalNav, siteContacts } from "@/lib/site";

const footerLinkClass =
  "inline-flex min-h-11 items-center text-body font-light text-text-secondary transition-colors hover:text-brand";

/**
 * Подвал: две группы ссылок + контакты + юр. ссылки + копирайт.
 * Без упоминания разработчика/CMS.
 */
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border bg-surface">
      <div className="mx-auto w-full max-w-[1564px] px-4 py-12 sm:px-8">
        <div className="mb-10">
          <Logo className="h-10 w-auto opacity-50" />
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          <nav aria-label="Компания">
            <ul className="flex flex-col gap-y-0.5">
              {companyLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Каталог">
            <ul className="flex flex-col gap-y-0.5">
              {catalogLinks.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={footerLinkClass}>
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
            <span className="py-2">{siteContacts.address}</span>
            <a
              href={siteContacts.phoneHref}
              className="inline-flex min-h-11 items-center font-medium text-text-primary transition-colors hover:text-brand"
            >
              {siteContacts.phoneDisplay}
            </a>
            <a
              href={siteContacts.emailHref}
              className="inline-flex min-h-11 items-center transition-colors hover:text-brand"
            >
              {siteContacts.email}
            </a>
            <span className="py-2 text-text-secondary">{siteContacts.hours}</span>
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
