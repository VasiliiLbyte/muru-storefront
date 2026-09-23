import { describe, expect, it } from "vitest";

import { adaptPublicRequisites, mergeStaticPageWithFallback } from "./endpoints";
import { staticPageBySlug } from "@/lib/content";
import type { PublicRequisites, StaticPage } from "@/lib/schemas";

describe("adaptPublicRequisites", () => {
  it("rejects CMS placeholder 8(800) phone in favor of canonical NAP", () => {
    const dto = {
      reqFullName: "ИП Филиппова П.Д.",
      reqShortName: "ИП Филиппова П.Д.",
      reqInn: "780631020295",
      reqOgrnip: "322784700264501",
      reqLegalAddress: "Республиканская 6",
      reqActualAddress: "Дубровская 13",
      reqPhone: "8 (800) 200 00 20",
      reqEmail: "info@muru.ru",
      reqSite: "muru.ru",
      reqBankDetails: "Альфа-Банк",
    } satisfies PublicRequisites;
    const phone = adaptPublicRequisites(dto).find(
      (row) => row.label === "Телефон, факс",
    );
    expect(phone?.value).toBe("+7 (981) 292-09-00");
  });
});

describe("mergeStaticPageWithFallback", () => {
  it("fills empty CMS seo and scrubs fake phones from delivery body", () => {
    const fallback = staticPageBySlug.get("help");
    const cms: StaticPage = {
      slug: "help",
      title: "КЛИЕНТАМ",
      body: "<p>ok</p>",
      heroImage: null,
      sections: null,
      seo: { title: "", description: "" },
      updatedAt: "2026-08-01T00:00:00.000Z",
    };
    const merged = mergeStaticPageWithFallback(cms, fallback);
    expect(merged.seo.title).toMatch(/Клиентам/);
    expect(merged.seo.description.length).toBeGreaterThan(10);
    expect(merged.seo.title).not.toBe("");

    const delivery: StaticPage = {
      slug: "delivery",
      title: "Доставка",
      body: "звонить 8 (800) 000-00-00",
      heroImage: null,
      sections: null,
      seo: { title: "Доставка и оплата — MURU", description: "ok" },
      updatedAt: "2026-08-01T00:00:00.000Z",
    };
    const scrubbed = mergeStaticPageWithFallback(
      delivery,
      staticPageBySlug.get("delivery"),
    );
    expect(scrubbed.body).toContain("+7 (981) 292-09-00");
    expect(scrubbed.body).not.toMatch(/8\s*\(\s*800\s*\)/);
  });
});
