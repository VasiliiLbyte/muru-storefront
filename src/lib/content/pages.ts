import type { StaticPage } from "@/lib/schemas";

/**
 * Статические страницы — lorem-плейсхолдеры той же структуры (политика контента).
 * Ключ — односегментный slug (company, contacts, ...).
 */
const LOREM =
  "Это нейтральный текст-плейсхолдер. Он повторяет структуру и примерную длину реального контента, но не копирует тексты muru.ru. Реальное наполнение придёт из CMS/CRM.";

const LOREM_SHORT =
  "Нейтральный плейсхолдер раздела. Текст будет заменён после подключения CMS.";

const LEGAL_PRIVACY_BODY = `
<h2>1. Общие положения</h2>
<p>${LOREM}</p>
<h2>2. Цели обработки персональных данных</h2>
<p>${LOREM_SHORT}</p>
<ul>
  <li>Оформление и исполнение заказов</li>
  <li>Обратная связь с клиентами</li>
  <li>Улучшение качества сервиса</li>
</ul>
<h2>3. Правовые основания</h2>
<p>${LOREM}</p>
<h3>3.1. Согласие субъекта</h3>
<p>${LOREM_SHORT}</p>
<h2>4. Передача данных третьим лицам</h2>
<p>${LOREM}</p>
<h2>5. Права субъекта персональных данных</h2>
<p>${LOREM_SHORT}</p>
<h2>6. Контактная информация</h2>
<p>${LOREM}</p>
`.trim();

const LEGAL_OFFER_BODY = `
<h2>1. Предмет договора</h2>
<p>${LOREM}</p>
<h2>2. Порядок оформления заказа</h2>
<p>${LOREM_SHORT}</p>
<h2>3. Цена и оплата</h2>
<p>${LOREM}</p>
<ul>
  <li>Стоимость товара указывается на сайте</li>
  <li>Оплата производится способами, доступными на витрине</li>
</ul>
<h2>4. Доставка</h2>
<p>${LOREM_SHORT}</p>
<h2>5. Возврат и обмен</h2>
<p>${LOREM}</p>
<h2>6. Ответственность сторон</h2>
<p>${LOREM_SHORT}</p>
<h2>7. Реквизиты продавца</h2>
<p>${LOREM}</p>
`.trim();

const DEFS: { slug: string; title: string; body?: string }[] = [
  { slug: "company", title: "О нас" },
  { slug: "contacts", title: "Контакты" },
  { slug: "requisites", title: "Реквизиты" },
  { slug: "help", title: "Клиентам" },
  { slug: "gifts", title: "Гид по подаркам" },
  {
    slug: "privacy",
    title: "Политика обработки персональных данных",
    body: LEGAL_PRIVACY_BODY,
  },
  { slug: "offer", title: "Публичная оферта", body: LEGAL_OFFER_BODY },
];

export const staticPages: StaticPage[] = DEFS.map((def) => ({
  slug: def.slug,
  title: def.title,
  body:
    def.body ??
    `<h2>${def.title}</h2><p>${LOREM}</p><p>${LOREM}</p>`,
  heroImage: null,
  seo: {
    title: `${def.title} — MURU`,
    description: `${def.title}: страница MURU.`,
  },
  updatedAt: "2026-01-01T00:00:00.000Z",
}));

export const staticPageBySlug = new Map<string, StaticPage>(
  staticPages.map((p) => [p.slug, p]),
);
