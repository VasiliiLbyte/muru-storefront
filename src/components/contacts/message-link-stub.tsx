"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { brandButtonSize } from "@/components/ui/brand-button-class";
import { cn } from "@/lib/utils";

export function MessageLinkStub() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        className={cn(
          brandButtonSize,
          "w-full bg-brand text-text-inverse hover:bg-brand-hover",
        )}
        onClick={() => setClicked(true)}
      >
        Написать сообщение
      </Button>
      {clicked ? (
        <p className="text-small text-text-muted" role="status">
          Форма обратной связи будет доступна после подключения бэкенда.
        </p>
      ) : null}
    </div>
  );
}
