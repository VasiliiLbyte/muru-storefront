"use client";

import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function CallbackForm() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, setPending] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    setPending(true);
    window.setTimeout(() => {
      setPending(false);
      setSubmitted(true);
      setName("");
      setPhone("");
    }, 400);
  };

  if (submitted) {
    return (
      <p className="text-body text-text-secondary" role="status">
        Заявка принята. Мы перезвоним вам в ближайшее время.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-caption font-medium tracking-[0.12em] text-text-heading uppercase">
        Заказать звонок
      </h2>
      <div className="flex flex-col gap-2">
        <label htmlFor="callback-name" className="text-small text-text-secondary">
          Имя
        </label>
        <Input
          id="callback-name"
          name="name"
          type="text"
          autoComplete="name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-11 rounded-none"
        />
      </div>
      <div className="flex flex-col gap-2">
        <label htmlFor="callback-phone" className="text-small text-text-secondary">
          Телефон
        </label>
        <Input
          id="callback-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="h-11 rounded-none"
        />
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={pending}
        className="h-11 w-full sm:w-auto sm:px-8"
      >
        {pending ? "Отправка…" : "Заказать звонок"}
      </Button>
    </form>
  );
}
