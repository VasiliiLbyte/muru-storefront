/**
 * M8 visual parity T1'/T6'/T7/T8/T9 (STOP-1: red gates on base 9139191).
 * Product src/** unchanged. Chromium + --disable-http2 for live prod API.
 */
import { test, expect, type Page } from "@playwright/test";
import fs from "node:fs";

const LISTING = "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/";

/** STOP-1 baseline A (raw gap header→card). Source: e2e/m7-baseline-ah.json */
const M7_BASELINE_GAP_HEADER_TO_CARD_PX = 165.59375;

function baselineGapPx(): number {
  try {
    const raw = fs.readFileSync("e2e/m7-baseline-ah.json", "utf8");
    const json = JSON.parse(raw) as {
      A?: { gapHeaderToCard_viewport?: number };
    };
    if (typeof json.A?.gapHeaderToCard_viewport === "number") {
      return json.A.gapHeaderToCard_viewport;
    }
  } catch {
    // fallback constant
  }
  return M7_BASELINE_GAP_HEADER_TO_CARD_PX;
}

test.use({
  browserName: "chromium",
  launchOptions: {
    args: ["--disable-http2"],
  },
});

async function settle(page: Page) {
  await page.waitForTimeout(400);
}

test.describe("M8 visual parity — mobile-393", () => {
  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "mobile-393",
      "M8 T1'/T6'/T7/T9-mobile: mobile-393 only",
    );
  });

  test("T1': listing ATC has visible label and is nearly full-bleed on image", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    const card = page.locator("article").first();
    await expect(card).toBeVisible({ timeout: 20000 });

    const addBtn = card.getByRole("button", { name: /корзин/i });
    await expect(addBtn, "T1': add-to-cart control must exist").toBeVisible();

    const visibleLabel = card.getByText("Добавить в корзину", {
      exact: true,
    });
    await expect(
      visibleLabel,
      "T1': visible caption «Добавить в корзину» must be present (parity with muru.ru full bar)",
    ).toBeVisible();

    const metrics = await page.evaluate(() => {
      const article = document.querySelector("article");
      const btn = [...(article?.querySelectorAll("button") ?? [])].find((b) =>
        /корзин/i.test(b.getAttribute("aria-label") ?? b.textContent ?? ""),
      );
      const img =
        article?.querySelector("img") ??
        article?.querySelector(".aspect-square, [class*='aspect']");
      if (!btn || !img) return null;
      const bb = btn.getBoundingClientRect();
      const ib = img.getBoundingClientRect();
      return {
        btnW: bb.width,
        imgW: ib.width,
        ratio: ib.width > 0 ? bb.width / ib.width : 0,
      };
    });

    expect(metrics, "T1': measurable ATC + image").not.toBeNull();
    expect(
      metrics!.ratio,
      `T1': ATC width/imageWidth must be ≥ 0.9 (got ${metrics!.ratio}, btn=${metrics!.btnW}, img=${metrics!.imgW})`,
    ).toBeGreaterThanOrEqual(0.9);
  });

  test("T6': raw gap header→first card ≤ baseline A + 1 (no toolbar subtract)", async ({
    page,
  }) => {
    const baseline = baselineGapPx();
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(page.locator("article").first()).toBeVisible({
      timeout: 20000,
    });

    const gap = await page.evaluate(() => {
      const header = document.querySelector("header");
      const card = document.querySelector("article");
      if (!header || !card) return null;
      const hr = header.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      return cr.top - hr.bottom;
    });

    expect(gap, "T6': raw gap measurable").not.toBeNull();
    expect(
      gap!,
      `T6': raw gap header→card (${gap}) must be ≤ baseline A+1 (${baseline + 1}) without toolbar subtraction`,
    ).toBeLessThanOrEqual(baseline + 1);
  });

  test("T7: home first banner title is below image (no overlay)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const layout = await page.evaluate(() => {
      const section = document.querySelector("main section");
      if (!section) return null;
      const img =
        section.querySelector("img") ??
        section.querySelector('[class*="object-cover"]');
      const title = section.querySelector("h2, h1");
      if (!img || !title) return null;
      const ir = img.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      return {
        titleTop: tr.top,
        imageBottom: ir.bottom,
        titleText: title.textContent?.trim().slice(0, 80) ?? "",
      };
    });

    expect(layout, "T7: first banner img+title measurable").not.toBeNull();
    expect(
      layout!.titleTop,
      `T7: title top (${layout!.titleTop}) must be ≥ image bottom (${layout!.imageBottom}) — stacked mobile banner, no overlay`,
    ).toBeGreaterThanOrEqual(layout!.imageBottom - 1);
  });

  test("T9 mobile: breadcrumbs show exactly one visible link (parent back)", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);

    const nav = page.getByRole("navigation", { name: /Хлебные крошки/i });
    await expect(nav).toBeVisible({ timeout: 20000 });

    const visibleLinks = nav.locator("a").filter({ visible: true });
    await expect(
      visibleLinks,
      "T9: mobile crumbs must show exactly one visible link (parent)",
    ).toHaveCount(1);
  });
});

test.describe("M8 visual parity — desktop 1440", () => {
  test.use({
    viewport: { width: 1440, height: 900 },
  });

  test.beforeEach(({}, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium",
      "M8 T8/T9-desktop: chromium (1440) only",
    );
  });

  test("T8: home first banner title stays overlaid inside image (desktop guard)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const layout = await page.evaluate(() => {
      const section = document.querySelector("main section");
      if (!section) return null;
      const img =
        section.querySelector("img") ??
        section.querySelector('[class*="object-cover"]');
      // Prefer visible heading (mobile duplicate is lg:hidden → 0×0 on desktop)
      const titles = [...section.querySelectorAll("h2, h1")];
      const title =
        titles.find((el) => {
          const r = el.getBoundingClientRect();
          return r.width > 0 && r.height > 0;
        }) ?? titles[0];
      if (!img || !title) return null;
      const ir = img.getBoundingClientRect();
      const tr = title.getBoundingClientRect();
      return {
        titleTop: tr.top,
        titleBottom: tr.bottom,
        imageTop: ir.top,
        imageBottom: ir.bottom,
      };
    });

    expect(layout, "T8: banner measurable").not.toBeNull();
    expect(
      layout!.titleTop,
      `T8: title top (${layout!.titleTop}) must be ≥ image top (${layout!.imageTop})`,
    ).toBeGreaterThanOrEqual(layout!.imageTop - 1);
    expect(
      layout!.titleBottom,
      `T8: title bottom (${layout!.titleBottom}) must be ≤ image bottom (${layout!.imageBottom}) — overlay preserved on desktop`,
    ).toBeLessThanOrEqual(layout!.imageBottom + 1);
  });

  test("T9 desktop: breadcrumbs show full trail (more than one link)", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);

    const nav = page.getByRole("navigation", { name: /Хлебные крошки/i });
    await expect(nav).toBeVisible({ timeout: 20000 });

    const visibleLinks = nav.locator("a").filter({ visible: true });
    const count = await visibleLinks.count();
    expect(
      count,
      `T9: desktop crumbs must show full trail (>1 visible link; got ${count})`,
    ).toBeGreaterThan(1);
  });
});
