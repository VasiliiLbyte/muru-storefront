"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    if (!token) next.token = "Ссылка недействительна или устарела";
    if (password.length < CUSTOMER_PASSWORD_MIN) {
      next.password = `Не менее ${CUSTOMER_PASSWORD_MIN} символов`;
    }
    if (password !== password2) next.password2 = "Пароли не совпадают";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    try {
      await accountFetchJson(
        "password/reset",
        {
          method: "POST",
          body: JSON.stringify({ token, password }),
        },
        { skipAuth: true },
      );
      setDone(true);
    } catch (err) {
      setError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось сменить пароль",
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!token) {
    return (
      <p className="text-body text-text-secondary" role="alert">
        В ссылке нет токена сброса. Запросите восстановление пароля снова.
      </p>
    );
  }

  if (done) {
    return (
      <div className="max-w-md space-y-4">
        <p className="text-body text-text-secondary">Пароль обновлён.</p>
        <Link
          href="/login/"
          className="text-body text-text-heading underline-offset-2 hover:underline"
        >
          Войти
        </Link>
      </div>
    );
  }

  return (
    <form className={formStackClassName} onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="reset-password" className={fieldLabelClassName}>
          Новый пароль
        </label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldInvalidProps(Boolean(fieldErrors.password))}
        />
        <p className={fieldHintClassName}>
          Не менее {CUSTOMER_PASSWORD_MIN} символов
        </p>
        {fieldErrors.password ? (
          <p className={fieldErrorClassName} role="alert">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>
      <div>
        <label htmlFor="reset-password2" className={fieldLabelClassName}>
          Повторите пароль
        </label>
        <Input
          id="reset-password2"
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
      {error ? (
        <p className={fieldErrorClassName} role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Сохранение…" : "Сохранить пароль"}
      </Button>
    </form>
  );
}
