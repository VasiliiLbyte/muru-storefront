import { ContactMap } from "@/components/contacts/contact-map";
import { ContactsDetails } from "@/components/contacts/contacts-details";
import { ContactsStoreImage } from "@/components/contacts/contacts-store-image";
import { MessageLinkStub } from "@/components/contacts/message-link-stub";
import type { Image } from "@/lib/schemas";

export function ContactsPageContent({
  heroImage,
}: {
  heroImage?: Image | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
      <ContactMap className="order-2 lg:order-1" />
      <div className="order-1 flex flex-col gap-10 lg:order-2">
        <ContactsStoreImage image={heroImage} />
        <ContactsDetails />
        <MessageLinkStub />
      </div>
    </div>
  );
}
