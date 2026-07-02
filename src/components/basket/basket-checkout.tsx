"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";

export function BasketCheckout({
  items: _items,
  disabled,
  className,
}: {
  items: CartItem[];
  disabled?: boolean;
  className?: string;
}) {
  const router = useRouter();

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <Button
        type="button"
        size="lg"
        disabled={disabled}
        onClick={() => router.push("/checkout/")}
        className="h-11 w-full"
      >
        Оформить заказ
      </Button>
    </div>
  );
}
