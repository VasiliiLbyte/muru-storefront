"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";

type Status = "loading" | "ok" | "error";

export function VerifyPanel() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState<Status>(token ? "loading" : "error");
  const [message, setMessage] = useState(
    token ? "Подтверждаем email…" : "В ссылке нет токена подтверждения.",
  );

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        await accountFetchJson(
          `verify?token=${encodeURIComponent(token)}`,
          { method: "GET" },
          { skipAuth: true },
        );
        if (!cancelled) {
          setStatus("ok");
          setMessage("Email подтверждён. Теперь можно войти.");
        }
      } catch (err) {
        if (!cancelled) {
          setStatus("error");
          setMessage(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось подтвердить email",
          );
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  return (
    <div className="max-w-md space-y-4">
      <p
        className="text-body text-text-secondary"
        role={status === "error" ? "alert" : "status"}
      >
        {message}
      </p>
      {status !== "loading" ? (
        <Link
          href="/login/"
          className="inline-block text-body text-text-heading underline-offset-2 hover:underline"
        >
          Войти
        </Link>
      ) : null}
    </div>
  );
}
