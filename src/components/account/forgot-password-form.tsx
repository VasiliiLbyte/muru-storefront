"use client";

import { useState } from "react";
import Link from "next/link";

import { SmartCaptchaField } from "@/components/account/smart-captcha-field";
import {
  fieldLabelClassName,
  formStackClassName,
} from "@/components/account/form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { accountFetchJson } from "@/lib/account/account-fetch";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await accountFetchJson(
        "password/forgot",
        {
          method: "POST",
          body: JSON.stringify({
            email: email.trim(),
            captchaToken: captchaToken || undefined,
          }),
        },
        { skipAuth: true },
      );
    } catch {
      // Always success UX — no enumeration
    } finally {
      setSubmitting(false);
      setDone(true);
    }
  }

  if (done) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-body text-text-secondary">
          Если аккаунт с таким email существует, мы отправили инструкции по
          восстановлению пароля.
        </p>
        <Link
          href="/login/"
          className="text-body text-text-heading underline-offset-2 hover:underline"
        >
          Вернуться ко входу
        </Link>
      </div>
    );
  }

  return (
    <form className={formStackClassName} onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="forgot-email" className={fieldLabelClassName}>
          Email
        </label>
        <Input
          id="forgot-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <SmartCaptchaField onToken={setCaptchaToken} />
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Отправка…" : "Отправить ссылку"}
      </Button>
      <Link href="/login/" className="text-small text-text-muted hover:underline">
        Ко входу
      </Link>
    </form>
  );
}
