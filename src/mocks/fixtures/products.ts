import type { Product, Unit } from "@/lib/schemas";

import {
  categoryBySlug,
  getLeafSlugs,
  topCategoryOf,
} from "./categories";
import { makeImage } from "./placeholders";
import { intBetween, pick, pickSome, priceFor, rngFrom } from "./seed";

/**
 * Дженерик-товары декора (нейтральные плейсхолдеры, НЕ контент muru.ru).
 * На каждый лист taxonomy — 8–16 товаров, детерминированно.
 */

const MATERIALS = [
  "Керамика",
  "Стекло",
  "Дерево",
  "Металл",
  "Лён",
  "Хлопок",
  "Ротанг",
  "Камень",
] as const;

const COLORS = [
  "Бежевый",
  "Оливковый",
  "Серый",
  "Молочный",
  "Терракотовый",
  "Графитовый",
] as const;

/** Базовое существительное для заголовка по slug листа (нейтральное). */
const NOUN_BY_LEAF: Record<string, string> = {
  "vazy-i-kuvshiny": "Ваза",
  podsvechniki: "Подсвечник",
  podsvechniki1: "Подсвечник",
  postery: "Постер",
  "predmety-dekora": "Предмет декора",
  svet: "Светильник",
  "korporativnye-podarki": "Подарочный набор",
  "kukhonnye-aksessuary": "Кухонный аксессуар",
  posuda: "Предмет посуды",
  servirovka: "Предмет сервировки",
  "tekstil-dlya-kukhni-i-stolovoy": "Кухонный текстиль",
  "khranenie-i-poryadok": "Короб для хранения",
  "korziny-i-pletenye-izdeliya": "Плетёная корзина",
  svechi: "Свеча",
  sukhotsvety: "Букет сухоцветов",
  "podarochnye-karty": "Подарочная карта",
  "распродажа": "Товар со скидкой",
  spalnya: "Текстиль для спальни",
  "gorshki-i-kashpo": "Кашпо",
  "floristicheskiy-instrument": "Флористический инструмент",
};

function nounFor(leaf: string): string {
  return NOUN_BY_LEAF[leaf] ?? "Предмет декора";
}

function unitFor(leaf: string): Unit {
  if (leaf === "korporativnye-podarki") return "set";
  return "pcs";
}

function buildProduct(leaf: string, i: number): Product {
  const rng = rngFrom(`product:${leaf}:${i}`);
  const noun = nounFor(leaf);
  const num = String(i).padStart(2, "0");
  const title = `${noun} ${num}`;
  const slug = `${leaf}-${num}`;
  const sku = `MRU-${leaf.slice(0, 4).toUpperCase()}-${num}`;

  const isGiftCard = leaf === "podarochnye-karty";
  const isSaleLeaf = leaf === "распродажа";
  const onSale = isSaleLeaf || rng() < 0.3;
  const price = priceFor(rng);
  const oldPrice = onSale ? Math.round((price * 1.25) / 50) * 50 : undefined;

  const top = topCategoryOf(leaf);
  const categorySlugs = Array.from(new Set([leaf, top]));

  return {
    id: `prod-${slug}`,
    sku,
    slug,
    title,
    price,
    oldPrice,
    currency: "RUB",
    images: isGiftCard
      ? [makeImage(title)]
      : [
          makeImage(`${title} — вид 1`),
          makeImage(`${title} — вид 2`),
          makeImage(`${title} — вид 3`),
        ],
    shortDescription: `${noun} из коллекции MURU — нейтральный плейсхолдер.`,
    description: `Демонстрационное описание для «${title}». Текст-плейсхолдер той же структуры, что и на витрине: материал, назначение, уход. Реальный контент придёт из CRM.`,
    attributes: isGiftCard
      ? {}
      : {
          material: pick(rng, MATERIALS),
          dimensions: {
            l: intBetween(rng, 8, 40),
            w: intBetween(rng, 8, 40),
            h: intBetween(rng, 5, 60),
            unit: "cm",
          },
          weight: {
            value: Math.round(intBetween(rng, 2, 60) * 10) / 100,
            unit: "kg",
          },
          color: pickSome(rng, COLORS, 3),
        },
    categorySlugs,
    inStock: rng() < 0.9,
    isOnSale: onSale,
    giftGuide: false,
    unit: unitFor(leaf),
    external_id: `1c-${sku}`,
    seo: {
      title: `${title} — MURU`,
      description: `${title}: купить в MURU. Нейтральный плейсхолдер описания.`,
    },
  };
}

function buildAll(): Product[] {
  const out: Product[] = [];
  for (const leaf of getLeafSlugs()) {
    // Детерминированное число товаров 8–16 на лист.
    const count = intBetween(rngFrom(`count:${leaf}`), 8, 16);
    for (let i = 1; i <= count; i++) {
      out.push(buildProduct(leaf, i));
    }
  }
  return out;
}

export const products: Product[] = buildAll();

export const productBySlug = new Map<string, Product>(
  products.map((p) => [p.slug, p]),
);

export const productBySku = new Map<string, Product>(
  products.map((p) => [p.sku, p]),
);

/** Гарантируем, что все categorySlugs реально существуют в taxonomy. */
export const ORPHAN_CATEGORY_SLUGS = [
  ...new Set(products.flatMap((p) => p.categorySlugs)),
].filter((slug) => !categoryBySlug.has(slug));
