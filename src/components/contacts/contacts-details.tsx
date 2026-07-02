import { siteContacts } from "@/lib/site";

export function ContactsDetails() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Адрес
        </h2>
        <p className="text-body text-text-secondary">{siteContacts.address}</p>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Режим работы
        </h2>
        <p className="text-body text-text-secondary">{siteContacts.hours}</p>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          Телефон
        </h2>
        <a
          href={siteContacts.phoneHref}
          className="text-body font-medium text-text-heading transition-colors hover:text-brand"
        >
          {siteContacts.phoneDisplay}
        </a>
      </div>

      <div>
        <h2 className="mb-2 text-caption font-medium tracking-[0.12em] text-text-secondary uppercase">
          E-mail
        </h2>
        <a
          href={siteContacts.emailHref}
          className="text-body text-text-secondary transition-colors hover:text-brand"
        >
          {siteContacts.email}
        </a>
      </div>
    </div>
  );
}
