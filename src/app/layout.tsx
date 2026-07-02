import type { Metadata } from "next";
import { fontVariables } from "@/lib/fonts";
import { MSWProvider } from "@/components/msw-provider";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { JsonLdScript } from "@/components/seo/jsonld-script";
import { organizationJsonLd } from "@/lib/seo/jsonld";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "MURU",
    template: "%s — MURU",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className={`${fontVariables} h-full antialiased`}>
      <head>
        <JsonLdScript data={organizationJsonLd()} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-sm focus:bg-brand focus:px-4 focus:py-2 focus:text-text-inverse"
        >
          Перейти к содержимому
        </a>
        <MSWProvider>
          <Header />
          {children}
          <Footer />
        </MSWProvider>
      </body>
    </html>
  );
}
