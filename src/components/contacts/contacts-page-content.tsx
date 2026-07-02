import { CallbackForm } from "@/components/contacts/callback-form";
import { ContactMap } from "@/components/contacts/contact-map";
import { ContactsDetails } from "@/components/contacts/contacts-details";
import { MessageLinkStub } from "@/components/contacts/message-link-stub";

export function ContactsPageContent() {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
      <ContactMap className="order-2 lg:order-1" />
      <div className="order-1 flex flex-col gap-10 lg:order-2">
        <ContactsDetails />
        <MessageLinkStub />
        <CallbackForm />
      </div>
    </div>
  );
}
