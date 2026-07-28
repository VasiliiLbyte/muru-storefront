/**
 * Security response headers for the storefront.
 *
 * Content-Security-Policy-Report-Only is intentional (step 1):
 * violations are visible in DevTools without breaking the storefront.
 * Enforcing Content-Security-Policy is a separate hardening pass after review.
 */

export const YANDEX_SMARTCAPTCHA_HOSTS = [
  "https://smartcaptcha.cloud.yandex.ru",
  "https://smartcaptcha.yandexcloud.net",
] as const;

export const CSP_REPORT_ONLY_HEADER = "Content-Security-Policy-Report-Only";

export function buildCspReportOnlyPolicy(): string {
  const captcha = YANDEX_SMARTCAPTCHA_HOSTS.join(" ");

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline' 'unsafe-eval' ${captcha}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data:",
    "connect-src 'self' https: http://localhost:* http://127.0.0.1:*",
    `frame-src 'self' ${captcha}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");
}

export type SecurityHeader = { key: string; value: string };

export function buildSecurityHeaders(): SecurityHeader[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    {
      key: CSP_REPORT_ONLY_HEADER,
      value: buildCspReportOnlyPolicy(),
    },
  ];
}
