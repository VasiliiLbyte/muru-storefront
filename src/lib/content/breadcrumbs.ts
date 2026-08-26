import type { BreadcrumbItem } from "@/lib/seo/jsonld";

export function homeCrumb(): BreadcrumbItem {
  return { name: "Главная", href: "/" };
}

export function companyCrumb(): BreadcrumbItem {
  return { name: "О нас", href: "/company/" };
}

export function helpCrumb(): BreadcrumbItem {
  return { name: "Клиентам", href: "/help/" };
}

/** Normalize CRM ALL-CAPS titles for breadcrumb display only (H1 stays CSS uppercase). */
export function toSentenceCaseRu(s: string): string {
  const t = s.trim();
  if (!t) return t;
  const lower = t.toLocaleLowerCase("ru-RU");
  return lower.charAt(0).toLocaleUpperCase("ru-RU") + lower.slice(1);
}

export function contentBreadcrumbs(
  ...items: BreadcrumbItem[]
): BreadcrumbItem[] {
  return [homeCrumb(), ...items];
}
