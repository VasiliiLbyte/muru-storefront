/**
 * M7 visual polish T1–T6 (STOP-2: expect PASS after M7-1…M7-6).
 * Chromium 393×852 + --disable-http2 for live prod API.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";

const LISTING = "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/";

/**
 * Baseline A: gap from sticky header bottom to first product card top (viewport px).
 * Source: e2e/m7-baseline-ah.json → A.gapHeaderToCard_viewport. STOP-1 T6 may PASS on equality.
 */
export const M7_BASELINE_GAP_HEADER_TO_CARD_PX = 165.59375;

test.use({
  browserName: "chromium",
  viewport: { width: 393, height: 852 },
  launchOptions: {
    args: ["--disable-http2"],
  },
});

test.beforeEach(({}, testInfo) => {
  test.skip(
    testInfo.project.name !== "mobile-393",
    "M7 visual polish: mobile-393 only",
  );
});

async function settle(page: Page) {
  await page.waitForTimeout(400);
}

function firstCard(page: Page): Locator {
  return page.locator("article").first();
}

test.describe("M7 visual polish T1–T6", () => {
  test("T1: compact add-to-cart — no visible label, width≤56, not full-bleed on image", async ({
    page,
  }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    const card = firstCard(page);
    await expect(card).toBeVisible({ timeout: 20000 });

    const addBtn = card.getByRole("button", { name: /корзин/i });
    await expect(addBtn, "add-to-cart control must exist").toBeVisible();

    // Label may remain in DOM (hidden lg:inline) — assert no *visible* caption
    const visibleLabel = card.getByText("Добавить в корзину", { exact: true });
    await expect(
      visibleLabel,
      "T1: visible «Добавить в корзину» caption must be hidden on mobile",
    ).toBeHidden();

    const btnBox = await addBtn.boundingBox();
    const imgBox = await card.locator(".aspect-square").first().boundingBox();
    expect(btnBox, "T1: add button bbox").not.toBeNull();
    expect(imgBox, "T1: image bbox").not.toBeNull();

    expect(
      btnBox!.width,
      `T1: add button width must be ≤56px (got ${btnBox!.width})`,
    ).toBeLessThanOrEqual(56);

    // Must not cover the full image width along the bottom edge
    const widthRatio = btnBox!.width / imgBox!.width;
    expect(
      widthRatio,
      `T1: add button must not span full image width (ratio=${widthRatio.toFixed(2)})`,
    ).toBeLessThan(0.5);
  });

  test("T2: filters row stays near header after scroll", async ({ page }) => {
    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(firstCard(page)).toBeVisible({ timeout: 20000 });

    await page.evaluate(() => window.scrollTo(0, 1500));
    await settle(page);

    const filters = page.getByRole("button", { name: /Фильтры/i }).first();
    await expect(filters).toBeVisible();

    const headerBox = await page.locator("header").first().boundingBox();
    const filtersBox = await filters.boundingBox();
    expect(headerBox, "T2: header bbox").not.toBeNull();
    expect(filtersBox, "T2: filters bbox").not.toBeNull();

    const headerBottom = headerBox!.y + headerBox!.height;
    expect(
      filtersBox!.y,
      `T2: filters.y must be ≥0 after scroll (got ${filtersBox!.y})`,
    ).toBeGreaterThanOrEqual(0);
    expect(
      filtersBox!.y,
      `T2: filters must stay near header (y≤headerBottom+8; y=${filtersBox!.y}, headerBottom=${headerBottom})`,
    ).toBeLessThanOrEqual(headerBottom + 8);
  });

  test("T3: home has ≥4 product PDP links", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const count = await page.evaluate(() => {
      const links = Array.from(
        document.querySelectorAll('a[href^="/catalog/"]'),
      ) as HTMLAnchorElement[];
      return links.filter((a) => {
        const parts = a.pathname.replace(/\/+$/, "").split("/").filter(Boolean);
        return parts[0] === "catalog" && parts.length >= 4;
      }).length;
    });

    expect(
      count,
      `T3: expected ≥4 product links on home (got ${count})`,
    ).toBeGreaterThanOrEqual(4);
    expect(count, "T3: at least one product link").toBeGreaterThanOrEqual(1);
  });

  test("T4: home h1 is not the first banner title", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const h1 = page.locator("h1");
    await expect(h1, "T4: exactly one h1").toHaveCount(1);
    const text = ((await h1.textContent()) ?? "").trim();

    const firstBannerTitle = await page.evaluate(() => {
      const section = document.querySelector("main section");
      const heading = section?.querySelector("h1, h2");
      return (heading?.textContent ?? "").trim();
    });

    expect(
      text,
      `T4: h1 must not equal first banner title ("${firstBannerTitle}")`,
    ).not.toBe(firstBannerTitle);
    expect(
      text,
      `T4: h1 must not contain «ЛЕТО В ДОМЕ» (got "${text}")`,
    ).not.toMatch(/ЛЕТО\s+В\s+ДОМЕ/i);
  });

  test("T5: closed search overlay — no desktop search in tab order / a11y", async ({
    page,
  }) => {
    for (const path of ["/login/", "/search/?q=ваза"] as const) {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await settle(page);

      const roleSearch = page.getByRole("search");
      await expect(
        roleSearch,
        `T5: visible [role=search] must be 0 when overlay closed on ${path} (got ${await roleSearch.count()})`,
      ).toHaveCount(0);

      // Tab through header — must not land on hidden desktop q / voice / find
      const forbidden: string[] = [];
      for (let i = 0; i < 25; i++) {
        await page.keyboard.press("Tab");
        const hit = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || !el.closest("header")) return null;
          const name =
            el.getAttribute("aria-label") ||
            (el as HTMLInputElement).name ||
            "";
          const tag = el.tagName.toLowerCase();
          if (
            (tag === "input" && (el as HTMLInputElement).name === "q") ||
            /Голосовой поиск|Найти/i.test(name)
          ) {
            // Allow if inside open dialog
            if (el.closest('[role="dialog"]')) return null;
            return `${tag}:${name || (el as HTMLInputElement).name}`;
          }
          return null;
        });
        if (hit) forbidden.push(hit);
      }

      expect(
        forbidden,
        `T5: header tab order must not include desktop search controls on ${path} (hits=${forbidden.join(", ")})`,
      ).toEqual([]);
    }
  });

  test("T6: gap header→first card ≤ baseline A (regression guard)", async ({
    page,
  }) => {
    // Re-read constant from measure file if present
    let baseline = M7_BASELINE_GAP_HEADER_TO_CARD_PX;
    try {
      const fs = await import("node:fs");
      const raw = fs.readFileSync("e2e/m7-baseline-ah.json", "utf8");
      const json = JSON.parse(raw) as {
        A?: { gapHeaderToCard_viewport?: number };
      };
      if (typeof json.A?.gapHeaderToCard_viewport === "number") {
        baseline = json.A.gapHeaderToCard_viewport;
      }
    } catch {
      // use exported constant
    }

    await page.goto(LISTING, { waitUntil: "domcontentloaded" });
    await settle(page);
    await expect(firstCard(page)).toBeVisible({ timeout: 20000 });

    const gap = await page.evaluate(() => {
      const header = document.querySelector("header");
      const card = document.querySelector("article");
      const filters = Array.from(document.querySelectorAll("button")).find((b) =>
        /Фильтры/i.test(b.textContent ?? ""),
      );
      // Outer sticky toolbar (contains the mobile filters row)
      const toolbar = filters?.closest(".mb-8") ?? filters?.parentElement;
      if (!header || !card) return null;
      const hr = header.getBoundingClientRect();
      const cr = card.getBoundingClientRect();
      const tr = toolbar?.getBoundingClientRect();
      const raw = cr.top - hr.bottom;
      // V3 guard: exclude sticky toolbar height now that it sits above the grid (M7-2)
      const toolbarH = tr && tr.bottom > hr.bottom ? tr.bottom - Math.max(tr.top, hr.bottom) : 0;
      return { raw, effective: raw - toolbarH, toolbarH };
    });

    expect(gap, "T6: gap measurable").not.toBeNull();
    expect(
      gap!.effective,
      `T6: effective gap header→card excluding toolbar (${gap!.effective}, raw=${gap!.raw}, toolbarH=${gap!.toolbarH}) must be ≤ baseline A (${baseline})`,
    ).toBeLessThanOrEqual(baseline + 1);
  });
});
