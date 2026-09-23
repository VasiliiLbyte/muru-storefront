import { describe, expect, it } from "vitest";

import {
  collectOrganizationSameAs,
  extractPostalCode,
  normalizeSameAsUrl,
  organizationJsonLd,
  streetAddressWithoutPostal,
} from "./jsonld";
import { SITE_CONTACTS_FALLBACK } from "@/lib/site";

describe("Organization JSON-LD helpers (SEO-014)", () => {
  it("extracts postalCode from factual address prefix", () => {
    expect(
      extractPostalCode(
        "192102, г. Санкт-Петербург, ул. Дубровская д.13, литера А, пом.27",
      ),
    ).toBe("192102");
    expect(
      streetAddressWithoutPostal(
        "192102, г. Санкт-Петербург, ул. Дубровская д.13, литера А, пом.27",
      ),
    ).toMatch(/^г\. Санкт-Петербург/);
  });

  it("normalizes t.me stubs and rejects invented hosts", () => {
    expect(normalizeSameAsUrl("t.me/muru_online")).toBe(
      "https://t.me/muru_online",
    );
    expect(normalizeSameAsUrl("not-a-url")).toBeUndefined();
  });

  it("emits contactPoint, postalCode, sameAs; never LocalBusiness", () => {
    const ld = organizationJsonLd({
      ...SITE_CONTACTS_FALLBACK,
      socialTelegram: "t.me/muru_online",
    });
    expect(ld["@type"]).toBe("Organization");
    expect(ld.contactPoint).toMatchObject({
      "@type": "ContactPoint",
      telephone: SITE_CONTACTS_FALLBACK.phoneDisplay,
      email: SITE_CONTACTS_FALLBACK.email,
    });
    expect(ld.address).toMatchObject({
      postalCode: "192102",
      addressCountry: "RU",
    });
    expect(ld.sameAs).toEqual(["https://t.me/muru_online"]);
    expect(JSON.stringify(ld)).not.toContain("LocalBusiness");
  });

  it("omits sameAs when no live profiles are present", () => {
    expect(collectOrganizationSameAs(SITE_CONTACTS_FALLBACK)).toEqual([]);
    const ld = organizationJsonLd(SITE_CONTACTS_FALLBACK);
    expect(ld).not.toHaveProperty("sameAs");
  });
});
