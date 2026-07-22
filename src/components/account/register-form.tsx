"use client";

import { useState } from "react";
import Link from "next/link";

import { SmartCaptchaField } from "@/components/account/smart-captcha-field";
import {
  fieldErrorClassName,
  fieldHintClassName,
  fieldInvalidProps,
  fieldLabelClassName,
  formStackClassName,
} from "@/components/account/form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import { CUSTOMER_PASSWORD_MIN } from "@/lib/schemas/account";

export function RegisterForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [consent, setConsent] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!fullName.trim()) next.fullName = "Укажите ФИО";
    if (!email.trim()) next.email = "Укажите email";
    if (password.length < CUSTOMER_PASSWORD_MIN) {
      next.password = `Не менее ${CUSTOMER_PASSWORD_MIN} символов`;
    }
    if (password !== password2) next.password2 = "Пароли не совпадают";
    if (!consent) next.consent = "Нужно согласие на обработку данных";
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      await accountFetchJson(
        "register",
        {
          method: "POST",
          body: JSON.stringify({
            fullName: fullName.trim(),
            email: email.trim(),
            phone: phone.trim() || undefined,
            password,
            consentAccepted: true,
            captchaToken: captchaToken || undefined,
          }),
        },
        { skipAuth: true },
      );
      setDone(true);
    } catch (err) {
      setError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось зарегистрироваться",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-body text-text-secondary">
          Мы отправили письмо на {email}. Перейдите по ссылке из письма, чтобы
          подтвердить адрес.
        </p>
        <Link
          href="/login/"
          className="text-body text-text-heading underline-offset-2 hover:underline"
        >
          Перейти ко входу
        </Link>
      </div>
    );
  }

  return (
    <form className={formStackClassName} onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="reg-name" className={fieldLabelClassName}>
          ФИО
        </label>
        <Input
          id="reg-name"
          name="fullName"
          autoComplete="name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          {...fieldInvalidProps(Boolean(fieldErrors.fullName))}
        />
        {fieldErrors.fullName ? (
          <p className={fieldErrorClassName} role="alert">
            {fieldErrors.fullName}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="reg-email" className={fieldLabelClassName}>
          Email
        </label>
        <Input
          id="reg-email"
          name="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...fieldInvalidProps(Boolean(fieldErrors.email))}
        />
        {fieldErrors.email ? (
          <p className={fieldErrorClassName} role="alert">
            {fieldErrors.email}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="reg-phone" className={fieldLabelClassName}>
          Телефон <span className="font-normal text-text-muted">(необязательно)</span>
        </label>
        <Input
          id="reg-phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="reg-password" className={fieldLabelClassName}>
          Пароль
        </label>
        <Input
          id="reg-password"
          name="password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldInvalidProps(Boolean(fieldErrors.password))}
        />
        <p className={fieldHintClassName}>Не менее {CUSTOMER_PASSWORD_MIN} символов</p>
        {fieldErrors.password ? (
          <p className={fieldErrorClassName} role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="reg-password2" className={fieldLabelClassName}>
          Повторите пароль
        </label>
        <Input
          id="reg-password2"
          name="password2"
          type="password"
          autoComplete="new-password"
          value={password2}
          onChange={(e) => setPassword2(e.target.value)}
          {...fieldInvalidProps(Boolean(fieldErrors.password2))}
        />
        {fieldErrors.password2 ? (
          <p className={fieldErrorClassName} role="alert">
            {fieldErrors.password2}
          </p>
        ) : null}
      </div>

      <SmartCaptchaField onToken={setCaptchaToken} />

      <label className="flex cursor-pointer items-start gap-3 text-body text-text-secondary">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 size-4 shrink-0 rounded-sm border-input accent-brand"
          {...fieldInvalidProps(Boolean(fieldErrors.consent))}
        />
        <span>
          Я соглашаюсь с{" "}
          <Link
            href="/legal/privacy/"
            className="text-text-heading underline-offset-2 hover:underline"
          >
            политикой обработки ПДн
          </Link>{" "}
          и{" "}
          <Link
            href="/legal/offer/"
            className="text-text-heading underline-offset-2 hover:underline"
          >
            публичной офертой
          </Link>
        </span>
      </label>
      {fieldErrors.consent ? (
        <p className={fieldErrorClassName} role="alert">
          {fieldErrors.consent}
        </p>
      ) : null}

      {error ? (
        <p className={fieldErrorClassName} role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Отправка…" : "Зарегистрироваться"}
      </Button>

      <p className="text-small text-text-muted">
        Уже есть аккаунт?{" "}
        <Link href="/login/" className="text-text-heading hover:underline">
          Войти
        </Link>
      </p>
    </form>
  );
}
