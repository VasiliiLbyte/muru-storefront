"use client";

import { useEffect, useState } from "react";

import { AccountShell } from "@/components/account/account-shell";
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
  accountFetch,
  accountFetchJson,
} from "@/lib/account/account-fetch";
import {
  AddressSchema,
  type AccountAddress,
} from "@/lib/schemas/account";
import { z } from "zod";

const AddressesSchema = z.array(AddressSchema);

const emptyForm = {
  label: "",
  city: "",
  address: "",
  cdekCityCode: "",
  isDefault: false,
};

export function AccountAddressesView() {
  const [items, setItems] = useState<AccountAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function reload() {
    const raw = await accountFetchJson("addresses");
    setItems(z.object({ addresses: AddressesSchema }).parse(raw).addresses);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await reload();
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof AccountApiError
              ? err.message
              : "Не удалось загрузить адреса",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- initial load only
  }, []);

  function startEdit(addr: AccountAddress) {
    setEditingId(addr.id);
    setForm({
      label: addr.label,
      city: addr.city,
      address: addr.address,
      cdekCityCode:
        addr.cdekCityCode != null ? String(addr.cdekCityCode) : "",
      isDefault: addr.isDefault,
    });
  }

  function resetForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFieldErrors({});
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const next: Record<string, string> = {};
    if (!form.city.trim()) next.city = "Укажите город";
    if (!form.address.trim()) next.address = "Укажите адрес";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) return;

    const body = {
      label: form.label.trim() || undefined,
      city: form.city.trim(),
      address: form.address.trim(),
      cdekCityCode: form.cdekCityCode.trim()
        ? Number(form.cdekCityCode)
        : null,
      isDefault: form.isDefault,
    };

    setSaving(true);
    try {
      if (editingId != null) {
        await accountFetchJson(`addresses/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        });
      } else {
        await accountFetchJson("addresses", {
          method: "POST",
          body: JSON.stringify(body),
        });
      }
      await reload();
      resetForm();
    } catch (err) {
      setError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось сохранить адрес",
      );
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: number) {
    setError(null);
    try {
      const res = await accountFetch(`addresses/${id}`, { method: "DELETE" });
      if (!res.ok) {
        throw new AccountApiError(res.status, null, "Не удалось удалить");
      }
      await reload();
      if (editingId === id) resetForm();
    } catch (err) {
      setError(
        err instanceof AccountApiError
          ? err.message
          : "Не удалось удалить адрес",
      );
    }
  }

  return (
    <AccountShell title="Адреса доставки">
      {loading ? (
        <p className="text-body text-text-muted">Загрузка…</p>
      ) : (
        <div className="space-y-10">
          {items.length === 0 ? (
            <p className="text-body text-text-muted">
              Сохранённых адресов пока нет.
            </p>
          ) : (
            <ul className="space-y-3">
              {items.map((addr) => (
                <li
                  key={addr.id}
                  className="flex flex-wrap items-start justify-between gap-3 border border-border px-4 py-3"
                >
                  <div>
                    <p className="text-body text-text-heading">
                      {addr.label || "Адрес"}
                      {addr.isDefault ? (
                        <span className="ml-2 text-small text-text-muted">
                          по умолчанию
                        </span>
                      ) : null}
                    </p>
                    <p className="text-body text-text-secondary">
                      {addr.city}, {addr.address}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => startEdit(addr)}
                    >
                      Изменить
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => void remove(addr.id)}
                    >
                      Удалить
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form className={formStackClassName} onSubmit={onSubmit} noValidate>
            <h2 className="font-display text-lg text-text-heading">
              {editingId != null ? "Редактировать адрес" : "Новый адрес"}
            </h2>
            <div>
              <label htmlFor="addr-label" className={fieldLabelClassName}>
                Название
              </label>
              <Input
                id="addr-label"
                value={form.label}
                onChange={(e) =>
                  setForm((f) => ({ ...f, label: e.target.value }))
                }
                placeholder="Дом, офис…"
              />
            </div>
            <div>
              <label htmlFor="addr-city" className={fieldLabelClassName}>
                Город
              </label>
              <Input
                id="addr-city"
                value={form.city}
                onChange={(e) =>
                  setForm((f) => ({ ...f, city: e.target.value }))
                }
                {...fieldInvalidProps(Boolean(fieldErrors.city))}
              />
              {fieldErrors.city ? (
                <p className={fieldErrorClassName} role="alert">
                  {fieldErrors.city}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="addr-line" className={fieldLabelClassName}>
                Адрес
              </label>
              <Input
                id="addr-line"
                value={form.address}
                onChange={(e) =>
                  setForm((f) => ({ ...f, address: e.target.value }))
                }
                {...fieldInvalidProps(Boolean(fieldErrors.address))}
              />
              {fieldErrors.address ? (
                <p className={fieldErrorClassName} role="alert">
                  {fieldErrors.address}
                </p>
              ) : null}
            </div>
            <div>
              <label htmlFor="addr-cdek" className={fieldLabelClassName}>
                Код города СДЭК{" "}
                <span className="font-normal text-text-muted">
                  (необязательно)
                </span>
              </label>
              <Input
                id="addr-cdek"
                inputMode="numeric"
                value={form.cdekCityCode}
                onChange={(e) =>
                  setForm((f) => ({ ...f, cdekCityCode: e.target.value }))
                }
              />
            </div>
            <label className="flex cursor-pointer items-center gap-3 text-body text-text-secondary">
              <input
                type="checkbox"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isDefault: e.target.checked }))
                }
                className="size-4 accent-brand"
              />
              Адрес по умолчанию
            </label>
            {error ? (
              <p className={fieldErrorClassName} role="alert">
                {error}
              </p>
            ) : null}
            <div className="flex gap-2">
              <Button type="submit" disabled={saving}>
                {saving ? "Сохранение…" : "Сохранить"}
              </Button>
              {editingId != null ? (
                <Button type="button" variant="outline" onClick={resetForm}>
                  Отмена
                </Button>
              ) : null}
            </div>
          </form>
        </div>
      )}
    </AccountShell>
  );
}
