"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  fieldErrorClassName,
  fieldInvalidProps,
  fieldLabelClassName,
  formStackFor,
} from "@/components/account/form-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import { completeLoginSuccess } from "@/lib/account/complete-login-success";
import { AuthTokensSchema } from "@/lib/schemas/account";
import type { LoginFormVariant } from "@/components/account/login-form-types";

const GENERIC_ERROR = "Неверный email или пароль";

export function EmailLoginPanel({
  variant = "page",
  onSuccess,
  onDismiss,
}: {
  variant?: LoginFormVariant;
  onSuccess?: () => void;
  onDismiss?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailId = variant === "modal" ? "login-email-modal" : "login-email";
  const passwordId =
    variant === "modal" ? "login-password-modal" : "login-password";

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await accountFetchJson(
        "login",
        {
          method: "POST",
          body: JSON.stringify({ email: email.trim(), password }),
        },
        { skipAuth: true },
      );
      const tokens = AuthTokensSchema.parse(data);
      await completeLoginSuccess(tokens, {
        variant,
        onSuccess,
        router,
        nextPath: searchParams.get("next"),
        fallbackEmail: email.trim(),
      });
    } catch (err) {
      if (err instanceof AccountApiError && err.status === 401) {
        setError(GENERIC_ERROR);
      } else {
        setError(
          err instanceof AccountApiError ? err.message : GENERIC_ERROR,
        );
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className={formStackFor(variant)} onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor={emailId} className={fieldLabelClassName}>
          Email
        </label>
        <Input
          id={emailId}
          name="email"
          type="email"
          autoComplete="email"
          inputMode="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...fieldInvalidProps(Boolean(error))}
        />
      </div>
      <div>
        <label htmlFor={passwordId} className={fieldLabelClassName}>
          Пароль
        </label>
        <Input
          id={passwordId}
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          {...fieldInvalidProps(Boolean(error))}
        />
      </div>

      {error ? (
        <p className={fieldErrorClassName} role="alert">
          {error}
        </p>
      ) : null}

      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="min-h-11 w-full"
      >
        {submitting ? "Вход…" : "Войти"}
      </Button>

      <div className="flex flex-col gap-1 text-small text-text-muted">
        <Link
          href="/password/forgot/"
          className="inline-flex min-h-11 items-center hover:text-text-heading hover:underline"
          onClick={() => onDismiss?.()}
        >
          Забыли пароль?
        </Link>
        <Link
          href="/register/"
          className="inline-flex min-h-11 items-center hover:text-text-heading hover:underline"
          onClick={() => onDismiss?.()}
        >
          Создать аккаунт
        </Link>
      </div>
    </form>
  );
}
