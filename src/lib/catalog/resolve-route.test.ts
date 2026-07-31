import { describe, expect, it } from "vitest";

import type { CatalogNavNode } from "@/lib/catalog/catalog-nav";
import { resolveCatalogSegments } from "@/lib/catalog/resolve-route";

/** Collision fixture: textile leaf shares slug with a top hub that has 6 children. */
const COLLISION_TREE: CatalogNavNode[] = [
  {
    slug: "tekstil",
    title: "Текстиль",
    children: [
      { slug: "kukhnya-i-stolovaya", title: "Кухня и столовая" },
      { slug: "postelnoe", title: "Постельное" },
    ],
  },
  {
    slug: "kukhnya-i-stolovaya",
    title: "Кухня и столовая",
    children: [
      { slug: "bokaly", title: "Бокалы" },
      { slug: "posuda", title: "Посуда" },
      { slug: "pribory", title: "Приборы" },
      { slug: "tekstil-dlya-stola", title: "Текстиль для стола" },
      { slug: "servirovka", title: "Сервировка" },
      { slug: "aksessuary", title: "Аксессуары" },
    ],
  },
  {
    slug: "floristika-dlya-doma",
    title: "Флористика",
    children: [{ slug: "compositions", title: "Композиции" }],
  },
];

describe("resolveCatalogSegments slug collision", () => {
  it("single-segment top URL resolves hub with children, not textile leaf", () => {
    const route = resolveCatalogSegments(["kukhnya-i-stolovaya"], COLLISION_TREE);
    expect(route).not.toBeNull();
    if (!route || route.type !== "category") {
      throw new Error("expected category route");
    }
    expect(route.children).toHaveLength(6);
    expect(route.children.map((c) => c.slug)).toEqual([
      "bokaly",
      "posuda",
      "pribory",
      "tekstil-dlya-stola",
      "servirovka",
      "aksessuary",
    ]);
  });

  it("two-segment textile path still resolves subcategory leaf", () => {
    const route = resolveCatalogSegments(
      ["tekstil", "kukhnya-i-stolovaya"],
      COLLISION_TREE,
    );
    expect(route).not.toBeNull();
    if (!route || route.type !== "subcategory") {
      throw new Error("expected subcategory route");
    }
    expect(route.parentSlug).toBe("tekstil");
    expect(route.subSlug).toBe("kukhnya-i-stolovaya");
    expect(route.node.children ?? []).toHaveLength(0);
  });

  it("unrelated top categories still resolve", () => {
    const route = resolveCatalogSegments(
      ["floristika-dlya-doma"],
      COLLISION_TREE,
    );
    expect(route?.type).toBe("category");
    if (!route || route.type !== "category") {
      throw new Error("expected category route");
    }
    expect(route.children).toHaveLength(1);
  });
});
