"use client";

import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { CartItem } from "@/lib/schemas";
import { cn } from "@/lib/utils";
import { brandButtonSize } from "@/components/ui/brand-button-class";

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
        disabled={disabled}
        onClick={() => router.push("/checkout/")}
        className={cn(brandButtonSize, "w-full")}
      >
        Оформить заказ
      </Button>
    </div>
  );
}
