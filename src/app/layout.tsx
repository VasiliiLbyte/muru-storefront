import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { MSWProvider } from "@/components/msw-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { CookieNotice } from "@/components/layout/cookie-notice";
import { YandexMetrikaGate } from "@/components/analytics/yandex-metrika-gate";
import { JsonLdScript } from "@/components/seo/jsonld-script";
import { getSiteContacts } from "@/lib/api/endpoints";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import {
  absoluteAssetUrl,
  DEFAULT_OG_IMAGE_PATH,
} from "@/lib/seo/page-metadata";
import { isSiteNoindex, siteUrl } from "@/lib/site";
import "./globals.css";

const defaultOgImage = absoluteAssetUrl(DEFAULT_OG_IMAGE_PATH);

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "MURU",
    template: "%s — MURU",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    siteName: "MURU",
    locale: "ru_RU",
    type: "website",
    images: [{ url: defaultOgImage }],
  },
  twitter: {
    card: "summary",
    images: [defaultOgImage],
  },
  ...(isSiteNoindex()
    ? { robots: { index: false, follow: false } }
    : {}),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#5D6B3A",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const contacts = await getSiteContacts();

  return (
    <html lang="ru" className={`${fontVariables} h-full antialiased`}>
      <head>
        <JsonLdScript data={organizationJsonLd(contacts)} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-brand focus:px-4 focus:py-2 focus:text-text-inverse"
        >
          Перейти к содержимому
        </a>
        <MSWProvider>
          <Header contacts={contacts} />
          {children}
          <Footer contacts={contacts} />
          <CookieNotice />
          <YandexMetrikaGate />
        </MSWProvider>
      </body>
    </html>
  );
}
