import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const KEY_PAGES = [
  { name: "home", path: "/" },
  { name: "catalog-root", path: "/catalog/" },
  {
    name: "catalog-listing",
    path: "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/",
  },
  {
    name: "product-pdp",
    path: "/catalog/vazy-i-aksessuary/vazy-i-kuvshiny/vazy-i-kuvshiny-01/",
  },
  { name: "basket", path: "/basket/" },
  { name: "search", path: "/search/" },
  { name: "contacts", path: "/company/contacts/" },
] as const;

for (const { name, path } of KEY_PAGES) {
  test(`a11y: ${name} (${path})`, async ({ page }) => {
    await page.goto(path, { waitUntil: "networkidle" });

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter((v) =>
      ["critical", "serious"].includes(v.impact ?? ""),
    );

    if (blocking.length > 0) {
      const summary = blocking
        .map(
          (v) =>
            `[${v.impact}] ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(", ")).join("\n  ")}`,
        )
        .join("\n\n");
      expect(blocking, `axe violations on ${path}:\n${summary}`).toHaveLength(0);
    }
  });
}
