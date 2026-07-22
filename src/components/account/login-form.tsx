"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  fieldErrorClassName,
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
import { safeNextPath } from "@/lib/account/safe-next";
import { mergeLocalFavoritesToAccount } from "@/lib/account/merge-favorites";
import { setAccessToken } from "@/lib/account/session";
import { AuthTokensSchema } from "@/lib/schemas/account";

const GENERIC_ERROR = "Неверный email или пароль";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const data = await accountFetchJson("login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const tokens = AuthTokensSchema.parse(data);
      setAccessToken(tokens.accessToken);
      try {
        await mergeLocalFavoritesToAccount();
      } catch {
        // merge must never block login
      }
      const next = safeNextPath(searchParams.get("next")) ?? "/account/";
      router.replace(next);
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
    <form className={formStackClassName} onSubmit={onSubmit} noValidate>
      <div>
        <label htmlFor="login-email" className={fieldLabelClassName}>
          Email
        </label>
        <Input
          id="login-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          {...fieldInvalidProps(Boolean(error))}
        />
      </div>
      <div>
        <label htmlFor="login-password" className={fieldLabelClassName}>
          Пароль
        </label>
        <Input
          id="login-password"
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

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? "Вход…" : "Войти"}
      </Button>

      <div className="flex flex-col gap-2 text-small text-text-muted">
        <Link href="/password/forgot/" className="hover:text-text-heading hover:underline">
          Забыли пароль?
        </Link>
        <Link href="/register/" className="hover:text-text-heading hover:underline">
          Создать аккаунт
        </Link>
      </div>
    </form>
  );
}
