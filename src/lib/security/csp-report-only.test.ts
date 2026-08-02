import { describe, expect, it } from "vitest";

import {
  CSP_REPORT_ONLY_HEADER,
  YANDEX_MAP_FRAME_HOSTS,
  YANDEX_SMARTCAPTCHA_HOSTS,
  buildCspReportOnlyPolicy,
  buildSecurityHeaders,
} from "./csp-report-only";

describe("buildCspReportOnlyPolicy / buildSecurityHeaders", () => {
  it("emits Content-Security-Policy-Report-Only and not enforcing CSP", () => {
    const headers = buildSecurityHeaders();
    const keys = headers.map((h) => h.key);

    expect(keys).toContain(CSP_REPORT_ONLY_HEADER);
    expect(keys).not.toContain("Content-Security-Policy");

    const csp = headers.find((h) => h.key === CSP_REPORT_ONLY_HEADER);
    expect(csp).toBeDefined();
    expect(csp!.value).toBe(buildCspReportOnlyPolicy());
  });

  it("includes baseline directives, SmartCaptcha and Yandex Maps hosts", () => {
    const policy = buildCspReportOnlyPolicy();

    expect(policy).toContain("default-src 'self'");
    expect(policy).toContain("object-src 'none'");
    expect(policy).toContain("base-uri 'self'");
    expect(policy).toContain("form-action 'self'");
    expect(policy).toContain("'unsafe-inline'");
    expect(policy).toContain("'unsafe-eval'");
    expect(policy).toContain("img-src 'self' data: blob: https:");
    expect(policy).toContain(
      "connect-src 'self' https: http://localhost:* http://127.0.0.1:*",
    );

    for (const host of YANDEX_SMARTCAPTCHA_HOSTS) {
      expect(policy).toContain(host);
    }
    for (const host of YANDEX_MAP_FRAME_HOSTS) {
      expect(policy).toContain(host);
    }
    expect(policy).toMatch(/frame-src 'self'/);
  });
});
