const REQUISITES = [
  { label: "Полное наименование", value: "Индивидуальный предприниматель Плейсхолдер А. А." },
  { label: "Сокращённое наименование", value: "ИП Плейсхолдер" },
  { label: "ИНН", value: "000000000000" },
  { label: "ОГРНИП", value: "000000000000000" },
  {
    label: "Юридический адрес",
    value: "000000, г. Санкт-Петербург, ул. Примерная, д. 1, кв. 1",
  },
  {
    label: "Фактический адрес",
    value: "192102, г. Санкт-Петербург, ул. Дубровская д.13, литера А, пом.27",
  },
  { label: "Телефон, факс", value: "+7 (812) 000-00-00" },
  { label: "Электронная почта", value: "hello@muru.ru" },
  { label: "Сайт", value: "muru.ru" },
  {
    label: "Банковские реквизиты",
    value:
      "БИК 000000000 Р/с №00000000000000000000 в Банк-плейсхолдер, Кор/счёт 00000000000000000000",
  },
] as const;

export function RequisitesTable() {
  return (
    <div className="max-w-3xl">
      <p className="mb-8 text-body text-text-secondary">
        Ниже приведены реквизиты компании. В случае необходимости получения
        дополнительных документов вы можете обратиться в бухгалтерию предприятия.
        Данные — нейтральные плейсхолдеры.
      </p>
      <dl className="divide-y divide-border border-y border-border">
        {REQUISITES.map((row) => (
          <div
            key={row.label}
            className="grid gap-2 py-4 sm:grid-cols-[minmax(0,14rem)_1fr]"
          >
            <dt className="text-small font-medium text-text-heading">{row.label}</dt>
            <dd className="text-body text-text-secondary">{row.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
