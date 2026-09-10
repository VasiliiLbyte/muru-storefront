import { splitContactAddress } from "@/lib/contact-address";
import { cn } from "@/lib/utils";

export function ContactAddress({
  address,
  className,
}: {
  address: string;
  className?: string;
}) {
  const lines = splitContactAddress(address);

  return (
    <span className={cn("block", className)}>
      {lines.map((line) => (
        <span key={line} className="block">
          {line}
        </span>
      ))}
    </span>
  );
}
