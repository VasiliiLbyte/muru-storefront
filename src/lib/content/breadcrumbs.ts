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

export function contentBreadcrumbs(...items: BreadcrumbItem[]): BreadcrumbItem[] {
  return [homeCrumb(), ...items];
}
