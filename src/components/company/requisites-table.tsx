export type RequisiteRow = { label: string; value: string };

export function RequisitesTable({ rows }: { rows: RequisiteRow[] }) {
  return (
    <div className="max-w-3xl">
      <p className="mb-8 text-body text-text-secondary">
        Ниже приведены реквизиты компании. В случае необходимости получения
        дополнительных документов вы можете обратиться в бухгалтерию предприятия.
        Данные — нейтральные плейсхолдеры.
      </p>
      <dl className="divide-y divide-border border-y border-border">
        {rows.map((row) => (
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
