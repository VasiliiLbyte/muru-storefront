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

/** Leading RU postal index from a CMS address string (e.g. "192102, г. ..."). */
export function extractPostalCode(address: string): string | undefined {
  const match = address.trim().match(/^(\d{6})\b/);
  return match?.[1];
}

/** Street line without the leading postal index. */
export function streetAddressWithoutPostal(address: string): string {
  const postal = extractPostalCode(address);
  const normalized = normalizeContactAddress(address);
  if (!postal) return normalized;
  return normalized
    .replace(new RegExp(`^${postal}\\s*,?\\s*`), "")
    .trim();
}

/** Normalize CMS social stubs to absolute https URLs; drop unknowns. */
export function normalizeSameAsUrl(
  raw: string | null | undefined,
): string | undefined {
  if (raw == null) return undefined;
  let value = raw.trim();
  if (!value) return undefined;
  if (value.startsWith("//")) value = `https:${value}`;
  if (/^(t\.me|vk\.com|wa\.me)\//i.test(value)) {
    value = `https://${value}`;
  }
  if (!/^https?:\/\//i.test(value)) return undefined;
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return undefined;
    return url.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

export function collectOrganizationSameAs(
  contacts: SiteContacts,
): string[] {
  const urls = [
    normalizeSameAsUrl(contacts.socialTelegram),
    normalizeSameAsUrl(contacts.socialWhatsapp),
    normalizeSameAsUrl(contacts.socialVk),
  ].filter((u): u is string => Boolean(u));
  return [...new Set(urls)];
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
  const postalCode = extractPostalCode(contacts.address);
  const sameAs = collectOrganizationSameAs(contacts);
  const address: Record<string, string> = {
    "@type": "PostalAddress",
    streetAddress: streetAddressWithoutPostal(contacts.address),
    addressLocality: "Санкт-Петербург",
    addressCountry: "RU",
  };
  if (postalCode) {
    address.postalCode = postalCode;
  }

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MURU",
    url: siteUrl,
    logo: absoluteUrl("/brand/muru-logo.svg"),
    address,
    telephone: contacts.phoneDisplay,
    email: contacts.email,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: contacts.phoneDisplay,
      email: contacts.email,
      contactType: "customer service",
      availableLanguage: ["Russian"],
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
  };
}

export function productJsonLd(product: Product) {
  const url = absoluteUrl(productHref(product));
  const images = product.images.map((img) => absoluteAssetUrl(img.url));

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ?? product.shortDescription ?? product.seo.description,
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
