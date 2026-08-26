import { splitContactAddress } from "@/lib/contact-address";
import { cn } from "@/lib/utils";

export function ContactAddress({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const { line1, line2 } = splitContactAddress(address);

  return (
    <span className={cn("block", className)}>
      <span className="block">{line1}</span>
      {line2 ? <span className="block">{line2}</span> : null}
    </span>
  );
}
