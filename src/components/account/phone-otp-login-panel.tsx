"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  fieldErrorClassName,
  fieldHintClassName,
  fieldInvalidProps,
  fieldLabelClassName,
  formStackClassName,
} from "@/components/account/form-styles";
import { SmartCaptchaField } from "@/components/account/smart-captcha-field";
import type { LoginFormVariant } from "@/components/account/login-form-types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import { completeLoginSuccess } from "@/lib/account/complete-login-success";
import { normalizeRussianPhoneForApi } from "@/lib/account/phone";
import {
  AuthTokensSchema,
  OtpRequestResultSchema,
} from "@/lib/schemas/account";

const INVALID_PHONE = "Укажите корректный номер телефона";
const INVALID_CODE = "Неверный код";
const TOO_MANY_ATTEMPTS = "Слишком много попыток, попробуйте позже";
const OTP_UNAVAILABLE = "Вход по телефону временно недоступен";

type OtpStep = "phone" | "code";

function isCaptchaError(err: AccountApiError): boolean {
  const body = err.body as {
    error?: { code?: string; message?: string };
  } | null;
  const code = body?.error?.code?.toLowerCase() ?? "";
  const message = body?.error?.message?.toLowerCase() ?? "";
  return (
    code.includes("captcha") ||
    message.includes("captcha") ||
    message.includes("капч")
  );
}

export function PhoneOtpLoginPanel({
  variant = "page",
  onSuccess,
}: {
  variant?: LoginFormVariant;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<OtpStep>("phone");
  const [phoneInput, setPhoneInput] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneId = variant === "modal" ? "login-phone-modal" : "login-phone";
  const codeId = variant === "modal" ? "login-otp-modal" : "login-otp";

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const id = window.setInterval(() => {
      setResendSeconds((s) => (s <= 1 ? 0 : s - 1));
    }, 1000);
    return () => window.clearInterval(id);
  }, [resendSeconds]);

  const requestOtp = useCallback(
    async (phone: string, options?: { fromResend?: boolean }) => {
      setError(null);
      setSubmitting(true);
      try {
        const payload: { phone: string; captchaToken?: string } = { phone };
        if (captchaToken.trim()) {
          payload.captchaToken = captchaToken.trim();
        }

        const data = await accountFetchJson(
          "otp/request",
          {
            method: "POST",
            body: JSON.stringify(payload),
          },
          { skipAuth: true },
        );
        const result = OtpRequestResultSchema.parse(data);
        setNormalizedPhone(phone);
        setCaptchaRequired(result.captchaRequired);
        setResendSeconds(result.resendAfterSec);
        setStep("code");
        if (!options?.fromResend) {
          setCode("");
        }
      } catch (err) {
        if (err instanceof AccountApiError) {
          if (err.status === 400 && isCaptchaError(err)) {
            setCaptchaRequired(true);
            setError("Подтвердите, что вы не робот");
          } else if (err.status === 400) {
            setError(INVALID_PHONE);
          } else if (err.status === 429) {
            setError(TOO_MANY_ATTEMPTS);
          } else if (err.status === 503) {
            setError(OTP_UNAVAILABLE);
          } else {
            setError(err.message);
          }
        } else {
          setError(INVALID_PHONE);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [captchaToken],
  );

  async function onRequestPhone(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeRussianPhoneForApi(phoneInput);
    if (!normalized) {
      setError(INVALID_PHONE);
      return;
    }
    await requestOtp(normalized);
  }

  async function onVerifyCode(e: React.FormEvent) {
    e.preventDefault();
    if (!normalizedPhone) return;
    if (!/^\d{4}$/.test(code)) {
      setError(INVALID_CODE);
      return;
    }

    setError(null);
    setSubmitting(true);
    try {
      const data = await accountFetchJson(
        "otp/verify",
        {
          method: "POST",
          body: JSON.stringify({ phone: normalizedPhone, code }),
        },
        { skipAuth: true },
      );
      const tokens = AuthTokensSchema.parse(data);
      await completeLoginSuccess(tokens, {
        variant,
        onSuccess,
        router,
        nextPath: searchParams.get("next"),
      });
    } catch (err) {
      if (err instanceof AccountApiError) {
        if (err.status === 400) {
          setError(INVALID_CODE);
        } else if (err.status === 429) {
          setError(TOO_MANY_ATTEMPTS);
        } else if (err.status === 503) {
          setError(OTP_UNAVAILABLE);
        } else {
          setError(err.message);
        }
      } else {
        setError(INVALID_CODE);
      }
    } finally {
      setSubmitting(false);
    }
  }

  function onChangeNumber() {
    setStep("phone");
    setCode("");
    setError(null);
  }

  async function onResend() {
    if (!normalizedPhone || resendSeconds > 0) return;
    await requestOtp(normalizedPhone, { fromResend: true });
  }

  if (step === "code") {
    return (
      <form className={formStackClassName} onSubmit={onVerifyCode} noValidate>
        <p className="text-body text-text-secondary">
          Звонок отправлен на{" "}
          <span className="text-text-heading">{normalizedPhone}</span>
        </p>

        <div>
          <label htmlFor={codeId} className={fieldLabelClassName}>
            Код из звонка
          </label>
          <Input
            id={codeId}
            name="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            pattern="\d{4}"
            maxLength={4}
            required
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
            {...fieldInvalidProps(Boolean(error))}
          />
          <p className={fieldHintClassName}>
            Последние 4 цифры номера входящего звонка
          </p>
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
          {submitting ? "Проверка…" : "Подтвердить"}
        </Button>

        <div className="flex flex-col gap-1 text-small text-text-muted">
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-left hover:text-text-heading hover:underline"
            onClick={onChangeNumber}
          >
            Изменить номер
          </button>
          <button
            type="button"
            disabled={resendSeconds > 0 || submitting}
            className="inline-flex min-h-11 items-center text-left hover:text-text-heading hover:underline disabled:cursor-not-allowed disabled:opacity-50"
            onClick={() => void onResend()}
          >
            {resendSeconds > 0
              ? `Позвонить снова (${resendSeconds} с)`
              : "Позвонить снова"}
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className={formStackClassName} onSubmit={onRequestPhone} noValidate>
      <div>
        <label htmlFor={phoneId} className={fieldLabelClassName}>
          Телефон
        </label>
        <Input
          id={phoneId}
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          placeholder="+7 …"
          required
          value={phoneInput}
          onChange={(e) => setPhoneInput(e.target.value)}
          {...fieldInvalidProps(Boolean(error))}
        />
        <p className={fieldHintClassName}>
          Мы позвоним на ваш номер — код = последние 4 цифры номера звонящего
          (не SMS).
        </p>
      </div>

      {captchaRequired ? (
        <SmartCaptchaField onToken={setCaptchaToken} />
      ) : null}

      <p className="text-small text-text-secondary">
        Нажимая «Получить звонок», вы соглашаетесь с{" "}
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
        .
      </p>

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
        {submitting ? "Отправка…" : "Получить звонок"}
      </Button>
    </form>
  );
}
