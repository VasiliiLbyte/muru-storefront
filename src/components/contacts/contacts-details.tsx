import type { SiteContacts } from "@/lib/site";

export function ContactsDetails({ contacts }: { contacts: SiteContacts }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-caption font-medium tracking-[0.12em] text-text-muted uppercase">
        Контакты
      </h2>

      <p className="text-body text-text-secondary">{contacts.address}</p>

      <a
        href={contacts.phoneHref}
        className="text-body font-medium text-text-heading transition-colors hover:text-brand"
      >
        {contacts.phoneDisplay}
      </a>

      <a
        href={contacts.emailHref}
        className="text-body text-text-secondary transition-colors hover:text-brand"
      >
        {contacts.email}
      </a>

      <p className="text-body text-text-secondary">{contacts.hours}</p>
    </div>
  );
}
