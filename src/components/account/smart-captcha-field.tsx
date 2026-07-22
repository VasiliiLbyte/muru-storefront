"use client";

import { SmartCaptcha } from "@yandex/smart-captcha";

const sitekey = process.env.NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY?.trim() ?? "";

export function SmartCaptchaField({
  onToken,
}: {
  onToken: (token: string) => void;
}) {
  if (!sitekey) {
    return (
      <p
        className="rounded-sm border border-border bg-surface px-3 py-2 text-small text-text-secondary"
        role="status"
      >
        SmartCaptcha не настроена (нет NEXT_PUBLIC_SMARTCAPTCHA_CLIENT_KEY). В
        dev бэкенд может принять пустой токен при SMARTCAPTCHA_DEV_BYPASS.
      </p>
    );
  }

  return (
    <div className="min-h-[100px]">
      <SmartCaptcha
        sitekey={sitekey}
        language="ru"
        onSuccess={(token) => onToken(token)}
      />
    </div>
  );
}

export function hasSmartCaptchaClientKey(): boolean {
  return Boolean(sitekey);
}
