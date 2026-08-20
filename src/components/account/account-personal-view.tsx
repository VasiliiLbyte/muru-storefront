"use client";

import { useEffect, useState } from "react";

import { AccountShell } from "@/components/account/account-shell";
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
import {
  CUSTOMER_PASSWORD_MIN,
  CustomerSchema,
  type Customer,
} from "@/lib/schemas/account";
import { useCustomerSessionStore } from "@/stores/customer-session-store";
import { z } from "zod";

export function AccountPersonalView() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [lastName, setLastName] = useState("");
  const [firstName, setFirstName] = useState("");
  const [middleName, setMiddleName] = useState("");
  const [phone, setPhone] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pwdSaving, setPwdSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [profileOk, setProfileOk] = useState(false);
  const [pwdOk, setPwdOk] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const me = z
          .object({ customer: CustomerSchema })
          .parse(await accountFetchJson("me")).customer;
        if (cancelled) return;
        setCustomer(me);
        setLastName(me.lastName);
        setFirstName(me.firstName);
        setMiddleName(me.middleName ?? "");
        setPhone(me.phone ?? "");
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить профиль",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    setProfileOk(false);
    setError(null);
    const next: Record<string, string> = {};
    if (!lastName.trim()) next.lastName = "Укажите фамилию";
    if (!firstName.trim()) next.firstName = "Укажите имя";
    if (!phone.trim()) next.phone = "Укажите телефон";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    setSaving(true);
    try {
      const middle = middleName.trim();
      const updated = z
        .object({ customer: CustomerSchema })
        .parse(
          await accountFetchJson("me", {
            method: "PUT",
            body: JSON.stringify({
              lastName: lastName.trim(),
              firstName: firstName.trim(),
              ...(middle ? { middleName: middle } : { middleName: "" }),
              phone: phone.trim(),
            }),
          }),
        ).customer;
      setCustomer(updated);
      setLastName(updated.lastName);
      setFirstName(updated.firstName);
      setMiddleName(updated.middleName ?? "");
      useCustomerSessionStore.getState().setAuthenticated({
        lastName: updated.lastName,
        firstName: updated.firstName,
        middleName: updated.middleName ?? "",
        fullName: updated.fullName,
        email: updated.email ?? "",
        phone: updated.phone ?? null,
      });
      setProfileOk(true);
    } catch (err) {
      setError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось сохранить",
      );
    } finally {
      setSaving(false);
    }
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwdOk(false);
    setPwdError(null);
    if (newPassword.length < CUSTOMER_PASSWORD_MIN) {
      setPwdError(`Новый пароль: не менее ${CUSTOMER_PASSWORD_MIN} символов`);
      return;
    }
    setPwdSaving(true);
    try {
      await accountFetchJson("me/password", {
        method: "PUT",
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      setOldPassword("");
      setNewPassword("");
      setPwdOk(true);
    } catch (err) {
      setPwdError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось сменить пароль",
      );
    } finally {
      setPwdSaving(false);
    }
  }

  return (
    <AccountShell title="Персональные данные">
      {loading ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : (
        <div className="space-y-12">
          <form className={formStackClassName} onSubmit={saveProfile} noValidate>
            <div>
              <label htmlFor="pers-email" className={fieldLabelClassName}>
                Email
              </label>
              <Input
                id="pers-email"
                value={customer?.email ?? ""}
                readOnly
                disabled
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label htmlFor="pers-last-name" className={fieldLabelClassName}>
                  Фамилия
                </label>
                <Input
                  id="pers-last-name"
                  autoComplete="family-name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  {...fieldInvalidProps(Boolean(fieldErrors.lastName))}
                />
                {fieldErrors.lastName ? (
                  <p className={fieldErrorClassName} role="alert">
                    {fieldErrors.lastName}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="pers-first-name" className={fieldLabelClassName}>
                  Имя
                </label>
                <Input
                  id="pers-first-name"
                  autoComplete="given-name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  {...fieldInvalidProps(Boolean(fieldErrors.firstName))}
                />
                {fieldErrors.firstName ? (
                  <p className={fieldErrorClassName} role="alert">
                    {fieldErrors.firstName}
                  </p>
                ) : null}
              </div>
              <div>
                <label htmlFor="pers-middle-name" className={fieldLabelClassName}>
                  Отчество{" "}
                  <span className="font-normal text-text-muted">
                    (необязательно)
                  </span>
                </label>
                <Input
                  id="pers-middle-name"
                  autoComplete="additional-name"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="pers-phone" className={fieldLabelClassName}>
                Телефон
              </label>
              <Input
                id="pers-phone"
                type="tel"
                autoComplete="tel"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                {...fieldInvalidProps(Boolean(fieldErrors.phone))}
              />
              {fieldErrors.phone ? (
                <p className={fieldErrorClassName} role="alert">
                  {fieldErrors.phone}
                </p>
              ) : null}
            </div>
            {error ? (
              <p className={fieldErrorClassName} role="alert">
                {error}
              </p>
            ) : null}
            {profileOk ? (
              <p className="text-small text-text-secondary" role="status">
                Сохранено
              </p>
            ) : null}
            <Button type="submit" disabled={saving}>
              {saving ? "Сохранение…" : "Сохранить"}
            </Button>
          </form>

          <form className={formStackClassName} onSubmit={changePassword} noValidate>
            <h2 className="font-display text-lg text-text-heading">
              Смена пароля
            </h2>
            <div>
              <label htmlFor="pers-old-pwd" className={fieldLabelClassName}>
                Текущий пароль
              </label>
              <Input
                id="pers-old-pwd"
                type="password"
                autoComplete="current-password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <label htmlFor="pers-new-pwd" className={fieldLabelClassName}>
                Новый пароль
              </label>
              <Input
                id="pers-new-pwd"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <p className={fieldHintClassName}>
                Не менее {CUSTOMER_PASSWORD_MIN} символов
              </p>
            </div>
            {pwdError ? (
              <p className={fieldErrorClassName} role="alert">
                {pwdError}
              </p>
            ) : null}
            {pwdOk ? (
              <p className="text-small text-text-secondary" role="status">
                Пароль изменён
              </p>
            ) : null}
            <Button type="submit" disabled={pwdSaving}>
              {pwdSaving ? "Сохранение…" : "Сменить пароль"}
            </Button>
          </form>
        </div>
      )}
    </AccountShell>
  );
}
