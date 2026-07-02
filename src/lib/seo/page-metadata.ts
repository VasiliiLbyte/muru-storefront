import type { Metadata } from "next";

import { absoluteUrl } from "@/lib/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  ogImage?: string;
  robots?: Metadata["robots"];
  /** Длинный title без суффикса template (главная). */
  titleAbsolute?: boolean;
};

/** Уникальные метаданные страницы: canonical, OG, Twitter. */
export function buildPageMetadata({
  title,
  description,
  path,
  ogImage,
  robots,
  titleAbsolute = false,
}: PageMetadataInput): Metadata {
  const pageTitle = title.replace(/ — MURU$/, "");
  const canonical = absoluteUrl(path);
  const imageUrl = ogImage
    ? ogImage.startsWith("http")
      ? ogImage
      : absoluteUrl(ogImage)
    : undefined;
  const ogTitle = title.includes("MURU") ? title : `${pageTitle} — MURU`;

  return {
    title: titleAbsolute ? { absolute: title } : pageTitle,
    description,
    alternates: { canonical },
    robots,
    openGraph: {
      title: ogTitle,
      description,
      type: "website",
      url: canonical,
      images: imageUrl ? [{ url: imageUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleAbsolute ? title : pageTitle,
      description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}
