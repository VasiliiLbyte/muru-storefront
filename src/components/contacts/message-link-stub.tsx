"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function MessageLinkStub() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <Button
        type="button"
        size="lg"
        className="h-11 w-full bg-brand px-8 text-body text-text-inverse hover:bg-brand-hover"
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
