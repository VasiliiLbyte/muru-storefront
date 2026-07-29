import type { NextConfig } from "next";

import { getBitrixRedirects } from "@/lib/seo/bitrix-redirects";
import { buildSecurityHeaders } from "@/lib/security/csp-report-only";

// Report-Only CSP is intentional (step 1). Enforcing Content-Security-Policy
// comes after collecting violations — do not flip the header name yet.
const securityHeaders = buildSecurityHeaders();

// X-Robots-Tag (D5): build-time. ON if NOINDEX_HEADER || SITE_NOINDEX || NEXT_PUBLIC_NOINDEX === "true".
// Independent of meta robots (isSiteNoindex); OR so staging meta noindex also emits the header.
// Env must be in .env.production before `next build` (headers() is not runtime PM2).
const noindexHeader =
  process.env.NOINDEX_HEADER === "true" ||
  process.env.SITE_NOINDEX === "true" ||
  process.env.NEXT_PUBLIC_NOINDEX === "true";

const nextConfig: NextConfig = {
  // Паритет с SEF-URL muru.ru (под будущие 301-редиректы Bitrix → чистые URL).
  trailingSlash: true,
  // Let src/proxy.ts own slash/case canonicalization so catalog map hits
  // without a trailing slash are one hop (D3), not Next 308 then 301.
  skipTrailingSlashRedirect: true,
  // React Compiler 1.0 (stable в Next 16). Требует babel-plugin-react-compiler.
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: [320, 600, 1200],
    imageSizes: [320, 600, 1200],
    // Заготовка под будущий image-прокси / CDN. Конкретные хосты уточним,
    // когда поднимется реальный backend (NEXT_PUBLIC_API_BASE).
    remotePatterns: [
      { protocol: "https", hostname: "murushop.ru" },
      { protocol: "https", hostname: "**.muru.ru" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
    // Локальные SVG-плейсхолдеры (доверенные, из /public) для next/image.
    // Реальные фото товаров будут растровыми из API.
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
  },
  async headers() {
    const headersList = [...securityHeaders];
    if (noindexHeader) {
      headersList.push({ key: "X-Robots-Tag", value: "noindex, nofollow" });
    }
    return [
      {
        source: "/:path*",
        headers: headersList,
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/catalog/%D1%80%D0%B0%D1%81%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6%D0%B0",
        destination: "/catalog/rasprodazha/",
        permanent: true,
      },
      {
        source: "/catalog/%D1%80%D0%B0%D1%81%D0%BF%D1%80%D0%BE%D0%B4%D0%B0%D0%B6%D0%B0/",
        destination: "/catalog/rasprodazha/",
        permanent: true,
      },
      {
        source: "/catalog/распродажа",
        destination: "/catalog/rasprodazha/",
        permanent: true,
      },
      {
        source: "/catalog/распродажа/",
        destination: "/catalog/rasprodazha/",
        permanent: true,
      },
      ...getBitrixRedirects(),
    ];
  },
};

export default nextConfig;
