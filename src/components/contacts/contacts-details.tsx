import type { SiteContacts } from "@/lib/site";

export function ContactsDetails({ contacts }: { contacts: SiteContacts }) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Адрес
        </h2>
        <p className="text-body text-text-secondary">{contacts.address}</p>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Режим работы
        </h2>
        <p className="text-body text-text-secondary">{contacts.hours}</p>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Телефон
        </h2>
        <a
          href={contacts.phoneHref}
          className="text-body font-medium text-text-heading transition-colors hover:text-brand"
        >
          {contacts.phoneDisplay}
        </a>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          E-mail
        </h2>
        <a
          href={contacts.emailHref}
          className="text-body text-text-secondary transition-colors hover:text-brand"
        >
          {contacts.email}
        </a>
      </div>
    </div>
  );
}
