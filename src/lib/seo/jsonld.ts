import type { Product } from "@/lib/schemas";
import { productHref } from "@/lib/catalog/urls";
import { normalizeContactAddress } from "@/lib/contact-address";
import {
  absoluteUrl,
  SITE_CONTACTS_FALLBACK,
  siteUrl,
  type SiteContacts,
} from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

function absoluteAssetUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
}

/** First non-empty trimmed string; empty string does not win over later candidates. */
function firstMeaningful(
  ...candidates: Array<string | null | undefined>
): string | undefined {
  for (const value of candidates) {
    if (typeof value !== "string") continue;
    const trimmed = value.trim();
    if (trimmed.length > 0) return trimmed;
  }
  return undefined;
}

/**
 * Product JSON-LD description: prefer real copy, never emit "" and never
 * duplicate the product title when seo.description fell back to the name.
 */
export function resolveProductJsonLdDescription(product: Product): string | undefined {
  const seoDesc = product.seo.description?.trim();
  const seoIfNotTitle =
    seoDesc && seoDesc !== product.title.trim() ? seoDesc : undefined;
  const material = product.attributes?.material?.trim();
  return firstMeaningful(
    product.description,
    product.shortDescription,
    seoIfNotTitle,
    material ? `Материал: ${material}` : undefined,
  );
}

export function breadcrumbJsonLd(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.href),
    })),
  };
}

export function itemListJsonLd(products: Product[], listUrl: string) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    url: absoluteUrl(listUrl),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: absoluteUrl(productHref(product)),
      name: product.title,
    })),
  };
}

export function organizationJsonLd(contacts: SiteContacts = SITE_CONTACTS_FALLBACK) {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MURU",
    url: siteUrl,
    logo: absoluteUrl("/brand/muru-logo.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: normalizeContactAddress(contacts.address),
      addressLocality: "Санкт-Петербург",
      addressCountry: "RU",
    },
    telephone: contacts.phoneDisplay,
    email: contacts.email,
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(productHref(product));
  const images = product.images.map((img) => absoluteAssetUrl(img.url));
  const description = resolveProductJsonLdDescription(product);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    ...(description ? { description } : {}),
    sku: product.sku,
    image: images.length === 1 ? images[0] : images,
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.inStock
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      url,
    },
  };
}
