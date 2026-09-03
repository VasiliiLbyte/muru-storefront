/**
 * Краткая сводка условий доставки для карточки товара.
 *
 * Источник — страница «Клиентам → Доставка» (`/help/delivery/`).
 * Намеренно без цифр: порог бесплатной доставки и тарифы по способам
 * на самой странице заполнены не полностью, а стоимость всё равно
 * считается в чекауте по адресу. Здесь только перевозчик и ссылки на
 * условия.
 */
export type DeliverySummaryRow = {
  label: string;
  value: string;
  note?: string;
};

export const DELIVERY_SUMMARY_ROWS: DeliverySummaryRow[] = [
  { label: "Доставка", value: "СДЭК" },
];

export const DELIVERY_HELP_LINKS = [
  { label: "Доставка", href: "/help/delivery/" },
  { label: "Оплата", href: "/help/terms/" },
  { label: "Возврат", href: "/help/refund/" },
] as const;
