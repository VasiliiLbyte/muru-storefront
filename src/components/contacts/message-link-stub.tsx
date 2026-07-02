"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

export function MessageLinkStub() {
  const [clicked, setClicked] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-caption font-medium tracking-[0.12em] text-text-heading uppercase">
        Написать сообщение
      </h2>
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="h-11 w-full sm:w-auto sm:px-8"
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
