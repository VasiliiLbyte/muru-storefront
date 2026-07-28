import { test, expect } from "@playwright/test";

import { IOS_ZOOM_ROUTES } from "./mobile-routes";

const MOBILE_PROJECTS = new Set(["mobile-375", "mobile-393", "mobile-412"]);

test.beforeEach(({}, testInfo) => {
  test.skip(
    !MOBILE_PROJECTS.has(testInfo.project.name),
    "iOS zoom baseline: mobile-375/393/412 only",
  );
});

type ZoomViolation = {
  path: string;
  tag: string;
  fontSize: number;
  name: string;
};

test("ios-zoom: form controls font-size >= 16px", async ({ page }) => {
  const violations: ZoomViolation[] = [];

  for (const path of IOS_ZOOM_ROUTES) {
    await page.goto(path, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(300);

    const fields = page.locator("input, select, textarea");
    const count = await fields.count();

    for (let i = 0; i < count; i += 1) {
      const el = fields.nth(i);
      if (!(await el.isVisible().catch(() => false))) continue;

      const box = await el.boundingBox();
      if (!box || box.width <= 0 || box.height <= 0) continue;

      const { fontSize, tag, name } = await el.evaluate((node) => {
        const style = window.getComputedStyle(node);
        return {
          fontSize: Number.parseFloat(style.fontSize),
          tag: node.tagName.toLowerCase(),
          name:
            (node as HTMLInputElement).name ||
            node.id ||
            node.getAttribute("aria-label") ||
            node.getAttribute("placeholder") ||
            "",
        };
      });

      if (Number.isFinite(fontSize) && fontSize < 16) {
        violations.push({ path, tag, fontSize, name });
      }
    }
  }

  const summary = violations
    .map(
      (v) =>
        `${v.path} <${v.tag}> name=${v.name || "—"} fontSize=${v.fontSize}px`,
    )
    .join("\n");

  expect(
    violations,
    `ios-zoom violations (${violations.length}):\n${summary}`,
  ).toEqual([]);
});
