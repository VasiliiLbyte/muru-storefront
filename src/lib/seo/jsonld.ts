import type { Product } from "@/lib/schemas";
import { productHref } from "@/lib/catalog/urls";
import { absoluteUrl, siteContacts, siteUrl } from "@/lib/site";

export type BreadcrumbItem = {
  name: string;
  href: string;
};

function absoluteAssetUrl(url: string): string {
  if (url.startsWith("http")) return url;
  return `${siteUrl}${url.startsWith("/") ? url : `/${url}`}`;
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

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "MURU",
    url: siteUrl,
    logo: absoluteUrl("/brand/muru-logo.svg"),
    address: {
      "@type": "PostalAddress",
      streetAddress: siteContacts.address,
      addressLocality: "Санкт-Петербург",
      addressCountry: "RU",
    },
    telephone: siteContacts.phoneDisplay,
    email: siteContacts.email,
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
