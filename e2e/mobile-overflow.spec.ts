import { test, expect } from "@playwright/test";

import { MOBILE_OVERFLOW_ROUTES } from "./mobile-routes";

test.beforeEach(({}, testInfo) => {
  test.skip(testInfo.project.name === "chromium", "mobile baseline only");
});

for (const path of MOBILE_OVERFLOW_ROUTES) {
  test(`overflow: ${path}`, async ({ page }) => {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    const finalUrl = page.url();
    const viewport = page.viewportSize();
    expect(viewport, `viewport missing for ${path}`).not.toBeNull();
    const viewportWidth = viewport!.width;

    const scrollWidth = await page.evaluate(
      () => document.documentElement.scrollWidth,
    );

    expect(
      scrollWidth,
      `horizontal overflow on ${path} (final=${finalUrl}): scrollWidth=${scrollWidth} viewportWidth=${viewportWidth}`,
    ).toBeLessThanOrEqual(viewportWidth + 1);
  });
}
