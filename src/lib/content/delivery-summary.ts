/**
 * Краткая сводка условий доставки для карточки товара.
 *
 * Источник — страница «Клиентам → Доставка» (`/help/delivery/`).
 * Здесь только те факты, которые там реально указаны: точные тарифы по
 * способам доставки на сайте пока не заполнены, поэтому вместо цифр —
 * ссылка на условия. Ничего не выдумываем: стоимость доставки считается
 * в чекауте по адресу.
 */
export type DeliverySummaryRow = {
  label: string;
  value: string;
  note?: string;
};

export const DELIVERY_SUMMARY_ROWS: DeliverySummaryRow[] = [
  {
    label: "Доставка",
    value: "Бесплатно от 3 900 ₽",
    note: "СДЭК и DPD — бесплатно от 7 000 ₽",
  },
  {
    label: "Оплата",
    value: "Онлайн на сайте",
    note: "Заказ отправляем после полной оплаты",
  },
];

export const DELIVERY_HELP_LINKS = [
  { label: "Доставка", href: "/help/delivery/" },
  { label: "Оплата", href: "/help/terms/" },
  { label: "Возврат", href: "/help/refund/" },
] as const;
