import type { NextConfig } from "next";

import { getBitrixRedirects } from "@/lib/seo/bitrix-redirects";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  // Заготовка под раздел hardening (Промпт 15): здесь позже добавим
  // Content-Security-Policy (с учётом Leaflet / шрифтов / Telegram) и HSTS.
  // Сейчас не включаем, чтобы не ломать dev до подключения всех внешних источников.
];

const nextConfig: NextConfig = {
  // Паритет с SEF-URL muru.ru (под будущие 301-редиректы Bitrix → чистые URL).
  trailingSlash: true,
  // React Compiler 1.0 (stable в Next 16). Требует babel-plugin-react-compiler.
  reactCompiler: true,
  experimental: {
    optimizePackageImports: ["lucide-react", "@base-ui/react"],
  },
  images: {
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
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  async redirects() {
    return getBitrixRedirects();
  },
};

export default nextConfig;
