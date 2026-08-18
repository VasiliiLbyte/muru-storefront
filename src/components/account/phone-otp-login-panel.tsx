"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";

import {
  fieldErrorClassName,
  fieldHintClassName,
  fieldLabelClassName,
  formStackFor,
} from "@/components/account/form-styles";
import { OtpInput } from "@/components/account/otp-input";
import { SmartCaptchaField } from "@/components/account/smart-captcha-field";
import type { LoginFormVariant } from "@/components/account/login-form-types";
import { Button } from "@/components/ui/button";
import { HOTSPOT_SHEET_QUERY } from "@/hooks/use-match-media";
import {
  AccountApiError,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import { completeLoginSuccess } from "@/lib/account/complete-login-success";
import {
  formatRussianPhoneForDisplay,
  formatRussianPhoneMask,
  normalizeRussianPhoneForApi,
  russianPhoneDigits10,
} from "@/lib/account/phone";
import {
  AuthTokensSchema,
  OtpRequestResultSchema,
} from "@/lib/schemas/account";
import { cn } from "@/lib/utils";

const INVALID_PHONE = "Укажите корректный номер телефона";
const INVALID_CODE = "Неверный код";
const TOO_MANY_ATTEMPTS = "Слишком много попыток, попробуйте позже";
const OTP_UNAVAILABLE = "Вход по телефону временно недоступен";

const CODE_LENGTH = 4;
const NO_CALL_HINT_DELAY_MS = 20_000;

export type OtpStep = "phone" | "code";

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

/** Countdown as `M:SS`. */
function formatCountdown(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function PhoneOtpLoginPanel({
  variant = "page",
  onSuccess,
  onStepChange,
}: {
  variant?: LoginFormVariant;
  onSuccess?: () => void;
  /** Lets the parent adapt its chrome (e.g. hide the email switch on `code`). */
  onStepChange?: (step: OtpStep) => void;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [step, setStep] = useState<OtpStep>("phone");
  const [phoneDigits, setPhoneDigits] = useState("");
  const [normalizedPhone, setNormalizedPhone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaRequired, setCaptchaRequired] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNoCallHint, setShowNoCallHint] = useState(false);
  const [codeFocusSignal, setCodeFocusSignal] = useState(0);

  const phoneInputRef = useRef<HTMLInputElement | null>(null);
  /** Guards auto-submit: never spend an attempt twice on the same code. */
  const lastSubmittedCodeRef = useRef<string | null>(null);

  const stackClassName = formStackFor(variant);
  const phoneId = variant === "modal" ? "login-phone-modal" : "login-phone";
  const codeId = variant === "modal" ? "login-otp-modal" : "login-otp";
  const codeLabelId = `${codeId}-label`;
  const errorId = `${codeId}-error`;

  useEffect(() => {
    onStepChange?.(step);
  }, [onStepChange, step]);

  // Touch keyboards jump the layout on open, so there focus follows the tap.
  // On the standalone page focus stays where the browser put it. The media
  // query is read directly: a subscribed hook is still `false` on first paint.
  useEffect(() => {
    if (step !== "phone" || variant !== "modal") return;
    if (window.matchMedia(HOTSPOT_SHEET_QUERY).matches) return;
    phoneInputRef.current?.focus();
  }, [step, variant]);

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
        setShowNoCallHint(false);
        lastSubmittedCodeRef.current = null;
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

  const verifyCode = useCallback(
    async (value: string) => {
      if (!normalizedPhone) return;
      if (!new RegExp(`^\\d{${CODE_LENGTH}}$`).test(value)) {
        setError(INVALID_CODE);
        return;
      }

      lastSubmittedCodeRef.current = value;
      setError(null);
      setSubmitting(true);
      try {
        const data = await accountFetchJson(
          "otp/verify",
          {
            method: "POST",
            body: JSON.stringify({ phone: normalizedPhone, code: value }),
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
        setCode("");
        setCodeFocusSignal((n) => n + 1);
      } finally {
        setSubmitting(false);
      }
    },
    [normalizedPhone, onSuccess, router, searchParams, variant],
  );

  useEffect(() => {
    if (step !== "code") return;
    if (code.length !== CODE_LENGTH) return;
    if (submitting) return;
    if (lastSubmittedCodeRef.current === code) return;
    void verifyCode(code);
  }, [code, step, submitting, verifyCode]);

  useEffect(() => {
    if (step !== "code" || showNoCallHint) return;
    const id = window.setTimeout(
      () => setShowNoCallHint(true),
      NO_CALL_HINT_DELAY_MS,
    );
    return () => window.clearTimeout(id);
  }, [step, showNoCallHint]);

  async function onRequestPhone(e: React.FormEvent) {
    e.preventDefault();
    const normalized = normalizeRussianPhoneForApi(`+7${phoneDigits}`);
    if (!normalized) {
      setError(INVALID_PHONE);
      return;
    }
    await requestOtp(normalized);
  }

  function onChangeNumber() {
    setStep("phone");
    setCode("");
    setError(null);
    lastSubmittedCodeRef.current = null;
  }

  async function onResend() {
    if (!normalizedPhone || resendSeconds > 0 || submitting) return;
    setCode("");
    await requestOtp(normalizedPhone, { fromResend: true });
  }

  if (step === "code") {
    return (
      <form
        className={stackClassName}
        onSubmit={(e) => {
          e.preventDefault();
          void verifyCode(code);
        }}
        noValidate
      >
        <p className="text-body text-text-secondary">
          Звонок отправлен на{" "}
          <span className="text-text-heading">
            {formatRussianPhoneForDisplay(normalizedPhone ?? "")}
          </span>{" "}
          <button
            type="button"
            className="text-small text-text-muted underline-offset-2 hover:text-text-heading hover:underline"
            onClick={onChangeNumber}
          >
            Изменить
          </button>
        </p>

        <div>
          <span id={codeLabelId} className={cn(fieldLabelClassName, "block")}>
            Код из звонка
          </span>
          <OtpInput
            value={code}
            onChange={setCode}
            idPrefix={codeId}
            labelId={codeLabelId}
            length={CODE_LENGTH}
            disabled={submitting}
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
            autoFocus
            focusSignal={codeFocusSignal}
          />
          <p className={fieldHintClassName}>
            Последние 4 цифры номера входящего звонка
          </p>
        </div>

        {error ? (
          <p id={errorId} className={fieldErrorClassName} role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          disabled={submitting}
          aria-busy={submitting || undefined}
          className="h-12 w-full gap-2"
        >
          {submitting ? (
            <>
              <Loader2 className="size-4 animate-spin" aria-hidden />
              Проверка…
            </>
          ) : (
            "Подтвердить"
          )}
        </Button>

        {showNoCallHint ? (
          <p className="text-small text-text-muted">
            Звонок не поступил? Позвоните снова или войдите по email.
          </p>
        ) : null}

        <div className="flex flex-col gap-1 text-small text-text-muted">
          <button
            type="button"
            disabled={resendSeconds > 0 || submitting}
            className="inline-flex min-h-11 items-center text-left hover:text-text-heading hover:underline disabled:cursor-not-allowed disabled:no-underline disabled:opacity-70"
            onClick={() => void onResend()}
          >
            {resendSeconds > 0
              ? `Позвонить снова через ${formatCountdown(resendSeconds)}`
              : "Позвонить снова"}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center text-left hover:text-text-heading hover:underline"
            onClick={onChangeNumber}
          >
            Изменить номер
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className={stackClassName} onSubmit={onRequestPhone} noValidate>
      <div>
        <label htmlFor={phoneId} className={fieldLabelClassName}>
          Телефон
        </label>
        <div
          className={cn(
            "flex h-12 w-full items-center rounded-sm border border-input bg-background pl-3",
            "transition-[color,border-color,box-shadow] focus-within:border-ring focus-within:ring-1 focus-within:ring-ring",
            error && "border-destructive ring-1 ring-destructive/30",
          )}
        >
          <span className="pr-2 text-base text-text-secondary" aria-hidden>
            +7
          </span>
          <span className="h-6 w-px bg-border" aria-hidden />
          <input
            ref={phoneInputRef}
            id={phoneId}
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="(900) 123-45-67"
            aria-describedby={`${phoneId}-hint`}
            aria-invalid={error ? true : undefined}
            required
            value={formatRussianPhoneMask(phoneDigits)}
            onChange={(e) => setPhoneDigits(russianPhoneDigits10(e.target.value))}
            className="h-full min-w-0 flex-1 bg-transparent px-3 text-base text-foreground outline-none placeholder:text-muted-foreground"
          />
        </div>
        <p id={`${phoneId}-hint`} className={fieldHintClassName}>
          Позвоним на ваш номер — код это последние 4 цифры входящего звонка
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
        disabled={submitting}
        aria-busy={submitting || undefined}
        className="h-12 w-full gap-2"
      >
        {submitting ? (
          <>
            <Loader2 className="size-4 animate-spin" aria-hidden />
            Отправка…
          </>
        ) : (
          "Получить звонок"
        )}
      </Button>
    </form>
  );
}
