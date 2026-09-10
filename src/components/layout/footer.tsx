import Link from "next/link";

import { ContactAddress } from "@/components/contacts/contact-address";
import { getCategories } from "@/lib/api/endpoints";
import { toSentenceCaseRu } from "@/lib/content/breadcrumbs";
import {
  catalogHref,
  companyLinks,
  legalNav,
  type NavItem,
  type SiteContacts,
} from "@/lib/site";
import { cn } from "@/lib/utils";

// На мобиле ссылки капслоком и в две колонки — по макету дизайнера.
// 12px/0.02em — самый крупный кегль, при котором длинные пункты
// («Комплексные наборы», «Натуральный декор») ещё держатся в одну строку
// в половине 390-й ширины; шаг строк 32px даёт ту же плотность, что в макете.
const footerLinkClass = cn(
  "inline-flex items-center font-light text-text-secondary transition-colors hover:text-brand",
  "max-lg:min-h-8 max-lg:text-[12px] max-lg:leading-[1.4] max-lg:tracking-[0.02em] max-lg:uppercase",
  "lg:min-h-11 lg:text-body",
);

const companyLinkClass = footerLinkClass;
const catalogLinkClass = footerLinkClass;

// На мобиле заголовки колонок мельче — по макету дизайнера они заметно
// меньше пунктов меню, а не вровень с ними.
const columnHeadingClass = cn(
  "font-medium tracking-[0.12em] text-text-muted uppercase",
  "max-lg:mb-2 max-lg:text-[10px] max-lg:leading-[1.2] max-lg:tracking-[0.16em]",
  "lg:mb-3 lg:text-caption",
);

/**
 * Подвал ≈ PDF: колонки выше, caps-меню, watermark справа #B8B8B8, © + legal.
 * Каталог — топ-категории из API (или MSW-фикстур).
 */
export async function Footer({ contacts }: { contacts: SiteContacts }) {
  const year = new Date().getFullYear();

  let catalogLinks: NavItem[] = [];
  try {
    catalogLinks = (await getCategories())
      .filter((c) => !c.parentSlug)
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((c) => ({
        label: toSentenceCaseRu(c.title),
        href: catalogHref.top(c.slug),
      }));
  } catch (err) {
    console.warn("[footer] categories fetch failed", err);
  }

  return (
    <footer className="mt-auto bg-surface">
      {/* Мобильный вертикальный ритм — один шаг 40px: над «Компанией»,
          между блоками, вокруг вордмарка и до нижней кромки (макет 2026-09-10). */}
      <div className="mx-auto w-full max-w-[1564px] px-4 max-lg:pt-10 max-lg:pb-10 sm:px-8 lg:pt-20 lg:pb-12">
        <div className="relative max-lg:pb-10 lg:pb-20">
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-3 md:gap-8">
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
              className="col-span-2 text-text-secondary not-italic max-lg:text-[12px] max-lg:leading-[1.5] md:col-span-1 lg:text-small"
            >
              <p className={columnHeadingClass}>Контакты</p>
              {/* На мобиле адрес слева, связь справа — как в макете */}
              <div className="grid grid-cols-2 gap-x-4 md:grid-cols-1">
                <ContactAddress
                  address={contacts.address}
                  className="max-w-[18rem] text-text-secondary max-lg:text-[12px] max-lg:leading-[1.5] lg:py-2 lg:text-small"
                />
                <div className="flex flex-col">
                  <a
                    href={contacts.phoneHref}
                    className="inline-flex font-medium text-text-primary transition-colors hover:text-brand max-lg:min-h-6 max-lg:items-start max-lg:leading-[1.5] lg:min-h-11 lg:items-center"
                  >
                    {contacts.phoneDisplay}
                  </a>
                  <a
                    href={contacts.emailHref}
                    className="inline-flex transition-colors hover:text-brand max-lg:min-h-6 max-lg:items-start max-lg:leading-[1.5] lg:min-h-11 lg:items-center"
                  >
                    {contacts.email}
                  </a>
                  <span className="text-text-secondary max-lg:min-h-6 max-lg:leading-[1.5] lg:py-2">
                    {contacts.hours}
                  </span>
                </div>
              </div>
            </address>
          </div>

          <div
            aria-hidden="true"
            /* Размер ровно как у логотипа в шапке: 86×24 на мобиле, 124×24 на десктопе */
            className="pointer-events-none absolute right-0 bottom-0 h-6 w-[86px] bg-text-muted lg:w-[124px]"
            style={{
              WebkitMaskImage: "url(/brand/muru-logo.svg)",
              maskImage: "url(/brand/muru-logo.svg)",
              WebkitMaskRepeat: "no-repeat",
              maskRepeat: "no-repeat",
              WebkitMaskSize: "contain",
              maskSize: "contain",
              WebkitMaskPosition: "right center",
              maskPosition: "right center",
            }}
          />
        </div>

        <div className="mt-10 flex flex-row items-start justify-between gap-4 max-lg:pt-0 sm:items-center lg:pt-6">
          <p className="inline-flex items-center leading-5 text-text-secondary max-lg:min-h-8 max-lg:text-[12px] lg:min-h-11 lg:text-small">
            © {year} MURU
          </p>
          <ul className="flex flex-col items-end text-right sm:flex-row sm:flex-wrap sm:gap-x-6">
            {legalNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="inline-flex items-center leading-5 text-text-secondary transition-colors hover:text-text-primary max-lg:min-h-8 max-lg:text-[12px] lg:min-h-11 lg:text-small"
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
