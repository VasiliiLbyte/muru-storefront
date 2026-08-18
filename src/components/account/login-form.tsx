"use client";

import { useState } from "react";

import { EmailLoginPanel } from "@/components/account/email-login-panel";
import type { LoginFormVariant } from "@/components/account/login-form-types";
import {
  PhoneOtpLoginPanel,
  type OtpStep,
} from "@/components/account/phone-otp-login-panel";

export type { LoginFormVariant } from "@/components/account/login-form-types";

type LoginMode = "phone" | "email";

export function LoginForm({
  variant = "page",
  onSuccess,
  onDismiss,
}: {
  variant?: LoginFormVariant;
  onSuccess?: () => void;
  /** Close modal when following forgot/register links. */
  onDismiss?: () => void;
}) {
  const [mode, setMode] = useState<LoginMode>("phone");
  const [phoneStep, setPhoneStep] = useState<OtpStep>("phone");
  const showModeSwitch = mode === "email" || phoneStep === "phone";

  return (
    <div className="flex flex-col gap-4">
      {mode === "phone" ? (
        <PhoneOtpLoginPanel
          variant={variant}
          onSuccess={onSuccess}
          onStepChange={setPhoneStep}
        />
      ) : (
        <EmailLoginPanel
          variant={variant}
          onSuccess={onSuccess}
          onDismiss={onDismiss}
        />
      )}

      {showModeSwitch ? (
        <button
          type="button"
          className="inline-flex min-h-11 items-center text-small text-text-muted hover:text-text-heading hover:underline"
          onClick={() => setMode((m) => (m === "phone" ? "email" : "phone"))}
        >
          {mode === "phone" ? "Войти по email и паролю" : "Войти по телефону"}
        </button>
      ) : null}
    </div>
  );
}
