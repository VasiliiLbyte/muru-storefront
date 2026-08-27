import { saleCategoryHref } from "@/lib/catalog/sale-category";

function resolveSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  // Production/staging builds must set NEXT_PUBLIC_SITE_URL (no muru.ru fallback).
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL is required in production/staging builds",
    );
  }
  return "http://127.0.0.1:3000";
}

/** Базовый URL витрины для canonical и JSON-LD. */
export const siteUrl = resolveSiteUrl();

/** Staging / preview: noindex when NEXT_PUBLIC_NOINDEX or SITE_NOINDEX is true. */
export function isSiteNoindex(): boolean {
  return (
    process.env.NEXT_PUBLIC_NOINDEX === "true" ||
    process.env.SITE_NOINDEX === "true"
  );
}

/** Абсолютный URL пути (с trailing slash, как у SEF). */
export function absoluteUrl(path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const withSlash = normalized.endsWith("/") ? normalized : `${normalized}/`;
  return `${siteUrl}${withSlash}`;
}

/**
 * Контакты витрины (UI-форма). Источник — getSiteContacts() → API с fallback.
 *
 * Телефон и e-mail в fallback — НЕЙТРАЛЬНЫЕ ПЛЕЙСХОЛДЕРЫ. Адрес и режим
 * работы — фактические (с muru.ru/company/contacts/).
 */
export type SiteContacts = {
  address: string;
  phoneDisplay: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  hours: string;
  /** Координаты офиса для карты на Контактах. */
  coordinates: { lat: number; lng: number };
  mapZoom: number;
};

/** Статический fallback при выключенном backend / ошибке / null-полях API. */
export const SITE_CONTACTS_FALLBACK: SiteContacts = {
  address:
    "192102, г. Санкт-Петербург, ул. Дубровская д. 13, литера А, пом. 27",
  phoneDisplay: "+7 (981) 292-09-00",
  phoneHref: "tel:+79812920900",
  email: "hello@muru.ru",
  emailHref: "mailto:hello@muru.ru",
  hours: "Пн–Пт: 9:00–18:00",
  coordinates: { lat: 59.9072, lng: 30.3184 },
  mapZoom: 16,
};

export type NavItem = {
  label: string;
  href: string;
  /** Brand on home for this item (e.g. Новинки), or when the route is active. */
  accent?: boolean;
};

/** Верхнее меню (как на muru.ru). */
export const mainNav: NavItem[] = [
  { label: "О нас", href: "/company/" },
  { label: "Новинки", href: "/new/", accent: true },
  { label: "Вдохновение", href: "/lookbooks/" },
  { label: "Коллекции", href: "/landings/" },
  { label: "Гид по подаркам", href: "/gifts/" },
  { label: "Клиентам", href: "/help/" },
  { label: "Контакты", href: "/company/contacts/" },
];

/** Ссылки на каталог (catch-all /catalog/[...slug]/, trailingSlash). */
export const catalogHref = {
  root: "/catalog/",
  top: (slug: string) => `/catalog/${slug}/`,
  sub: (parentSlug: string, slug: string) => `/catalog/${parentSlug}/${slug}/`,
};

/** Ссылки футера: компания (uppercase в CSS) и каталог. */
export const companyLinks: NavItem[] = [
  { label: "О нас", href: "/company/" },
  { label: "Новинки", href: "/new/" },
  { label: "Вдохновение", href: "/lookbooks/" },
  { label: "Коллекции", href: "/landings/" },
  { label: "Гид по подаркам", href: "/gifts/" },
  { label: "Клиентам", href: "/help/" },
  { label: "Распродажа", href: saleCategoryHref() },
  { label: "Реквизиты", href: "/company/requisites/" },
];

/** Юридические ссылки (чистые URL; 301 с Bitrix — Промпт 12). */
export const legalNav: NavItem[] = [
  { label: "Политика обработки ПДн", href: "/legal/privacy/" },
  { label: "Публичная оферта", href: "/legal/offer/" },
];
