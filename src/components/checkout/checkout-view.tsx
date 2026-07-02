"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/client";
import {
  calculateCdekWeb,
  createWebPayment,
  getCdekAddressSuggestions,
  getCdekCities,
  getCdekPvz,
} from "@/lib/api/endpoints";
import { toWebCheckoutItems } from "@/lib/cart/checkout-mapping";
import { hydrateCartProducts } from "@/lib/cart/hydrate";
import { computeCartTotals } from "@/lib/cart/totals";
import { PENDING_WEB_PAYMENT_ID_KEY } from "@/lib/checkout/constants";
import { cityNameForAddressSuggest } from "@/lib/checkout/city-name-for-address";
import { formatPrice } from "@/lib/format";
import type {
  AddressSuggestion,
  CdekCalcResult,
  CdekCity,
  CdekPvz,
  Product,
} from "@/lib/schemas";
import { useCartItems, useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";

const PvzMap = dynamic(() => import("@/components/checkout/pvz-map"), {
  ssr: false,
});

const textareaClassName =
  "flex min-h-24 w-full min-w-0 rounded-sm border border-input bg-background px-2 py-2 text-body text-foreground transition-[color,border-color,box-shadow] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70";

function isEmailValid(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.includes("@") && trimmed.includes(".");
}

function isPhoneValid(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return digits.length === 10 || digits.length === 11;
}

export function CheckoutView() {
  const router = useRouter();
  const items = useCartItems();
  const removeItem = useCartStore((s) => s.removeItem);

  const [cartHydrated, setCartHydrated] = useState(false);
  const [hydratedKey, setHydratedKey] = useState("");
  const [productsBySku, setProductsBySku] = useState<Map<string, Product>>(
    () => new Map(),
  );

  const [recipientName, setRecipientName] = useState("");
  const [recipientPhone, setRecipientPhone] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [consentAccepted, setConsentAccepted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [cityQuery, setCityQuery] = useState("");
  const [citySuggestions, setCitySuggestions] = useState<CdekCity[]>([]);
  const [cityLookupState, setCityLookupState] = useState<
    "idle" | "loading" | "empty" | "error"
  >("idle");
  const [selectedCity, setSelectedCity] = useState<CdekCity | null>(null);

  const [deliveryType, setDeliveryType] = useState<"door" | "pvz">("door");

  const [pvzList, setPvzList] = useState<CdekPvz[]>([]);
  const [selectedPvz, setSelectedPvz] = useState<CdekPvz | null>(null);
  const [pvzView, setPvzView] = useState<"map" | "list">("map");

  const [calc, setCalc] = useState<CdekCalcResult | null>(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const [streetQuery, setStreetQuery] = useState("");
  const [streetSuggestions, setStreetSuggestions] = useState<AddressSuggestion[]>(
    [],
  );
  const [streetLookupState, setStreetLookupState] = useState<
    "idle" | "loading" | "empty" | "error"
  >("idle");
  const [selectedStreetValue, setSelectedStreetValue] = useState("");
  const [flat, setFlat] = useState("");

  const skusKey = useMemo(
    () => items.map((i) => i.sku).sort().join(","),
    [items],
  );

  const loadingProducts = items.length > 0 && hydratedKey !== skusKey;
  const activeProducts =
    items.length === 0 ? new Map<string, Product>() : productsBySku;
  const visibleItems = useMemo(
    () => items.filter((i) => activeProducts.has(i.sku)),
    [items, activeProducts],
  );
  const totals = computeCartTotals(visibleItems, activeProducts);

  const houseAddress = useMemo(() => {
    const street = selectedStreetValue.trim() || streetQuery.trim();
    if (!street) return "";
    const flatTrimmed = flat.trim();
    return flatTrimmed ? `${street}, кв ${flatTrimmed}` : street;
  }, [selectedStreetValue, streetQuery, flat]);

  const formatEta = (option: CdekCalcResult["door"]): string => {
    if (!option || option.periodMin <= 0) return "";
    return `${option.periodMin}–${option.periodMax} дн.`;
  };

  const formatCityLabel = (city: CdekCity) => {
    const name = (city.city || city.full_name || "").trim();
    if (!name) return `Город ${city.code}`;
    if (city.region) return `${name} (${city.region})`;
    return city.full_name.trim() || name;
  };

  const selectedTariff = deliveryType === "pvz" ? calc?.pvz : calc?.door;

  useEffect(() => {
    const finish = () => setCartHydrated(true);
    const unsub = useCartStore.persist.onFinishHydration(finish);
    if (useCartStore.persist.hasHydrated()) {
      finish();
    }
    return unsub;
  }, []);

  useEffect(() => {
    if (!cartHydrated) return;
    if (items.length === 0) {
      router.replace("/basket/");
    }
  }, [cartHydrated, items.length, router]);

  useEffect(() => {
    if (items.length === 0) return;

    let cancelled = false;

    hydrateCartProducts(items.map((i) => i.sku)).then((map) => {
      if (cancelled) return;

      for (const item of items) {
        if (!map.has(item.sku)) removeItem(item.sku);
      }

      setProductsBySku(map);
      setHydratedKey(skusKey);
    });

    return () => {
      cancelled = true;
    };
  }, [skusKey, items, removeItem]);

  useEffect(() => {
    if (selectedCity && selectedCity.full_name === cityQuery) return;
    const q = cityQuery.trim();
    if (q.length < 2) {
      setCitySuggestions([]);
      setCityLookupState("idle");
      return;
    }
    setCityLookupState("loading");
    const timer = setTimeout(() => {
      getCdekCities(q)
        .then((list) => {
          setCitySuggestions(list);
          setCityLookupState(list.length === 0 ? "empty" : "idle");
        })
        .catch(() => {
          setCitySuggestions([]);
          setCityLookupState("error");
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [cityQuery, selectedCity]);

  useEffect(() => {
    if (deliveryType !== "door" || !selectedCity) {
      setStreetSuggestions([]);
      setStreetLookupState("idle");
      return;
    }
    if (selectedStreetValue && selectedStreetValue === streetQuery) {
      setStreetSuggestions([]);
      setStreetLookupState("idle");
      return;
    }
    const q = streetQuery.trim();
    if (q.length < 3) {
      setStreetSuggestions([]);
      setStreetLookupState("idle");
      return;
    }
    setStreetLookupState("loading");
    const timer = setTimeout(() => {
      getCdekAddressSuggestions(q, cityNameForAddressSuggest(selectedCity))
        .then((list) => {
          setStreetSuggestions(list);
          setStreetLookupState(list.length === 0 ? "empty" : "idle");
        })
        .catch(() => {
          setStreetSuggestions([]);
          setStreetLookupState("error");
        });
    }, 350);
    return () => clearTimeout(timer);
  }, [deliveryType, selectedCity, streetQuery, selectedStreetValue]);

  useEffect(() => {
    if (!selectedCity) {
      setPvzList([]);
      setSelectedPvz(null);
      setCalc(null);
      return;
    }

    let cancelled = false;

    if (deliveryType === "pvz") {
      getCdekPvz(selectedCity.code)
        .then((list) => {
          if (!cancelled) setPvzList(list);
        })
        .catch(() => {
          if (!cancelled) setPvzList([]);
        });
    } else {
      setPvzList([]);
      setSelectedPvz(null);
    }

    const calcTimer = setTimeout(() => {
      if (visibleItems.length === 0) return;
      setCalcLoading(true);
      calculateCdekWeb({
        toCityCode: selectedCity.code,
        items: visibleItems.map((i) => ({ sku: i.sku, quantity: i.qty })),
      })
        .then((result) => {
          if (!cancelled) setCalc(result);
        })
        .catch(() => {
          if (!cancelled)
            setCalc({
              door: null,
              pvz: null,
              errors: ["Не удалось рассчитать доставку"],
            });
        })
        .finally(() => {
          if (!cancelled) setCalcLoading(false);
        });
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(calcTimer);
    };
  }, [selectedCity, deliveryType, visibleItems]);

  const selectStreetSuggestion = (suggestion: AddressSuggestion) => {
    setSelectedStreetValue(suggestion.value);
    setStreetQuery(suggestion.value);
    setStreetSuggestions([]);
    setStreetLookupState("idle");
    if (suggestion.flat) setFlat(suggestion.flat);
  };

  const selectCity = (city: CdekCity) => {
    setSelectedCity(city);
    setCityQuery(city.full_name);
    setCitySuggestions([]);
    setCityLookupState("idle");
    setSelectedPvz(null);
    setCalc(null);
  };

  const formValid =
    recipientName.trim().length >= 2 &&
    isPhoneValid(recipientPhone) &&
    isEmailValid(email) &&
    consentAccepted &&
    !!selectedCity &&
    !!selectedTariff &&
    (deliveryType === "door"
      ? (selectedStreetValue.trim() || streetQuery.trim()).length >= 3
      : !!selectedPvz);

  const canSubmit =
    formValid &&
    visibleItems.length > 0 &&
    !submitting &&
    !loadingProducts &&
    cartHydrated;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!canSubmit) return;

    if (!selectedCity || !selectedTariff) return;

    setSubmitting(true);
    setSubmitError(null);

    const address =
      deliveryType === "pvz"
        ? selectedPvz
          ? `${selectedCity.full_name}, ПВЗ: ${selectedPvz.address}`
          : selectedCity.full_name
        : houseAddress
          ? `${selectedCity.full_name}, ${houseAddress}`
          : selectedCity.full_name;

    const payload = {
      items: toWebCheckoutItems(items),
      deliveryMode: "delivery" as const,
      deliveryOption:
        deliveryType === "pvz" ? `PVZ:${selectedPvz?.code ?? ""}` : "DOOR",
      deliveryEta: formatEta(selectedTariff),
      address,
      comment: comment.trim(),
      birthDate: null,
      recipientName: recipientName.trim(),
      recipientPhone: recipientPhone.trim(),
      email: email.trim(),
      cdekTariffCode: selectedTariff.tariffCode,
      cdekCityCode: selectedCity.code,
      cdekCityName: selectedCity.full_name,
      cdekPvzCode: deliveryType === "pvz" ? (selectedPvz?.code ?? null) : null,
      cdekPvzAddress:
        deliveryType === "pvz" ? (selectedPvz?.address ?? null) : null,
    };

    try {
      const { paymentId, confirmationUrl } = await createWebPayment(payload);
      sessionStorage.setItem(PENDING_WEB_PAYMENT_ID_KEY, paymentId);
      window.location.assign(confirmationUrl);
      return;
    } catch (error) {
      setSubmitError(
        error instanceof ApiError
          ? error.message
          : "Не удалось создать платёж. Попробуйте позже.",
      );
      setSubmitting(false);
    }
  };

  if (!cartHydrated || (items.length === 0 && cartHydrated)) {
    return (
      <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
        <p className="pt-8 text-body text-text-muted">Загрузка…</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-[1564px] px-4 pb-16 sm:px-8">
      <h1 className="mb-8 pt-8 font-display text-display text-text-heading">
        Оформление заказа
      </h1>

      {loadingProducts ? (
        <p className="text-body text-text-muted">Загрузка корзины…</p>
      ) : (
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_22rem] lg:gap-16">
          <form
            id="checkout-form"
            onSubmit={handleSubmit}
            className="flex flex-col gap-6"
            noValidate
          >
            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-recipient-name"
                className="text-body text-text-secondary"
              >
                ФИО получателя
              </label>
              <Input
                id="checkout-recipient-name"
                name="recipientName"
                type="text"
                autoComplete="name"
                required
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-recipient-phone"
                className="text-body text-text-secondary"
              >
                Телефон
              </label>
              <Input
                id="checkout-recipient-phone"
                name="recipientPhone"
                type="tel"
                autoComplete="tel"
                required
                value={recipientPhone}
                onChange={(e) => setRecipientPhone(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-email"
                className="text-body text-text-secondary"
              >
                E-mail
              </label>
              <Input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label htmlFor="checkout-city" className="text-body text-text-secondary">
                Город доставки
              </label>
              <Input
                id="checkout-city"
                value={cityQuery}
                onChange={(e) => {
                  setCityQuery(e.target.value);
                  if (selectedCity && e.target.value !== selectedCity.full_name) {
                    setSelectedCity(null);
                  }
                }}
                placeholder="Начните вводить город"
              />
              {cityLookupState === "loading" ? (
                <p className="text-small text-text-muted">Ищем город…</p>
              ) : null}
              {cityLookupState === "empty" ? (
                <p className="text-small text-text-muted">Город не найден.</p>
              ) : null}
              {cityLookupState === "error" ? (
                <p className="text-small text-destructive">
                  Не удалось загрузить города.
                </p>
              ) : null}
              {cityLookupState === "idle" && citySuggestions.length > 0 ? (
                <div className="flex max-h-48 flex-col gap-1 overflow-y-auto border border-border">
                  {citySuggestions.map((city) => (
                    <button
                      key={`${city.code}-${city.full_name}`}
                      type="button"
                      className="px-2 py-1 text-left text-small hover:bg-surface"
                      onClick={() => selectCity(city)}
                    >
                      {formatCityLabel(city)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            {selectedCity ? (
              <div className="flex flex-col gap-3">
                <p className="text-body text-text-secondary">Способ доставки</p>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant={deliveryType === "door" ? "default" : "outline"}
                    onClick={() => setDeliveryType("door")}
                  >
                    До двери
                  </Button>
                  <Button
                    type="button"
                    variant={deliveryType === "pvz" ? "default" : "outline"}
                    onClick={() => {
                      setDeliveryType("pvz");
                      setPvzView("map");
                    }}
                  >
                    До ПВЗ
                  </Button>
                </div>

                {deliveryType === "door" ? (
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="checkout-street"
                        className="text-body text-text-secondary"
                      >
                        Улица и дом
                      </label>
                      <Input
                        id="checkout-street"
                        value={streetQuery}
                        onChange={(e) => {
                          setStreetQuery(e.target.value);
                          if (
                            selectedStreetValue &&
                            e.target.value !== selectedStreetValue
                          ) {
                            setSelectedStreetValue("");
                          }
                        }}
                        placeholder="Например: Невский пр., 1"
                      />
                      {streetLookupState === "loading" ? (
                        <p className="text-small text-text-muted">Ищем адрес…</p>
                      ) : null}
                      {streetLookupState === "empty" ? (
                        <p className="text-small text-text-muted">
                          Ничего не найдено — уточните улицу или введите адрес
                          вручную.
                        </p>
                      ) : null}
                      {streetLookupState === "idle" &&
                      streetSuggestions.length > 0 ? (
                        <div className="flex max-h-48 flex-col gap-1 overflow-y-auto border border-border">
                          {streetSuggestions.map((s) => (
                            <button
                              key={s.value}
                              type="button"
                              className="px-2 py-1 text-left text-small hover:bg-surface"
                              onClick={() => selectStreetSuggestion(s)}
                            >
                              {s.value}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                    <div className="flex flex-col gap-2">
                      <label
                        htmlFor="checkout-flat"
                        className="text-body text-text-secondary"
                      >
                        Квартира / офис
                      </label>
                      <Input
                        id="checkout-flat"
                        value={flat}
                        onChange={(e) => setFlat(e.target.value)}
                        placeholder="Например: 10"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={pvzView === "map" ? "default" : "outline"}
                        onClick={() => setPvzView("map")}
                      >
                        На карте
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant={pvzView === "list" ? "default" : "outline"}
                        onClick={() => setPvzView("list")}
                      >
                        Списком
                      </Button>
                    </div>
                    {pvzList.length === 0 ? (
                      <p className="text-small text-text-muted">
                        {calcLoading
                          ? "Загрузка пунктов…"
                          : "Пункты выдачи не найдены"}
                      </p>
                    ) : pvzView === "map" ? (
                      <>
                        {pvzList.some(
                          (p) => p.location.latitude && p.location.longitude,
                        ) ? (
                          <PvzMap
                            points={pvzList}
                            selectedCode={selectedPvz?.code ?? null}
                            onSelect={setSelectedPvz}
                          />
                        ) : (
                          <p className="text-small text-text-muted">
                            Нет координат — выберите из списка.
                          </p>
                        )}
                        {selectedPvz ? (
                          <div className="border border-border p-3 text-body">
                            <p className="font-medium text-text-heading">
                              {selectedPvz.name}
                            </p>
                            <p className="text-small text-text-secondary">
                              {selectedPvz.address}
                            </p>
                          </div>
                        ) : (
                          <p className="text-small text-text-muted">
                            Нажмите на метку, чтобы выбрать пункт выдачи
                          </p>
                        )}
                      </>
                    ) : (
                      <div className="flex max-h-56 flex-col gap-2 overflow-y-auto">
                        {pvzList.map((pvz) => (
                          <button
                            key={pvz.code}
                            type="button"
                            className={cn(
                              "border px-3 py-2 text-left text-body",
                              selectedPvz?.code === pvz.code
                                ? "border-brand bg-surface"
                                : "border-border",
                            )}
                            onClick={() => setSelectedPvz(pvz)}
                          >
                            <p className="font-medium text-text-heading">
                              {pvz.name}
                            </p>
                            <p className="text-small text-text-secondary">
                              {pvz.address}
                            </p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {calcLoading ? (
                  <p className="text-small text-text-muted">
                    Расчёт стоимости доставки…
                  </p>
                ) : null}
                {calc?.errors && calc.errors.length > 0 ? (
                  <p className="text-small text-destructive">
                    {calc.errors.join("; ")}
                  </p>
                ) : null}
              </div>
            ) : null}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="checkout-comment"
                className="text-body text-text-secondary"
              >
                Комментарий к заказу
              </label>
              <textarea
                id="checkout-comment"
                name="comment"
                rows={4}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={textareaClassName}
              />
            </div>

            <label className="flex cursor-pointer items-start gap-3 text-body text-text-secondary">
              <input
                type="checkbox"
                checked={consentAccepted}
                onChange={(e) => setConsentAccepted(e.target.checked)}
                className="mt-0.5 size-4 shrink-0 rounded-sm border-input accent-brand"
              />
              <span>
                Я соглашаюсь с{" "}
                <Link
                  href="/legal/privacy/"
                  className="text-text-heading underline-offset-2 transition-colors hover:text-brand hover:underline"
                >
                  условиями обработки персональных данных
                </Link>
              </span>
            </label>

            {submitError ? (
              <p className="text-small text-destructive" role="alert">
                {submitError}
              </p>
            ) : null}

            <Button
              type="submit"
              size="lg"
              disabled={!canSubmit}
              className="h-11 w-full lg:hidden"
            >
              {submitting ? "Переход к оплате…" : "Оплатить"}
            </Button>
          </form>

          <aside
            className={cn(
              "flex h-fit flex-col gap-6 border border-border bg-surface p-6 lg:sticky lg:top-24",
            )}
          >
            <h2 className="font-display text-h2 text-text-heading">
              Ваш заказ
            </h2>

            <ul className="flex flex-col gap-4 border-b border-border pb-4">
              {visibleItems.map((item) => {
                const product = activeProducts.get(item.sku);
                if (!product) return null;
                return (
                  <li
                    key={item.sku}
                    className="flex flex-col gap-1 border-b border-border pb-4 last:border-b-0 last:pb-0"
                  >
                    <p className="text-body text-text-heading">{product.title}</p>
                    <p className="text-small text-text-secondary">
                      {item.qty} × {formatPrice(product.price, product.currency)}
                    </p>
                    <p className="text-body font-medium text-text-heading">
                      {formatPrice(
                        product.price * item.qty,
                        product.currency,
                      )}
                    </p>
                  </li>
                );
              })}
            </ul>

            <dl className="flex flex-col gap-3 text-body">
              <div className="flex justify-between gap-4 border-t border-border pt-3">
                <dt className="font-medium text-text-heading">Сумма</dt>
                <dd className="font-medium text-text-heading">
                  {formatPrice(totals.subtotal)}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-text-secondary">Доставка</dt>
                <dd className="text-text-heading">
                  {selectedTariff
                    ? formatPrice(selectedTariff.deliverySum)
                    : "—"}
                </dd>
              </div>
            </dl>

            <p className="text-small text-text-muted">
              Итоговая сумма будет подтверждена при оплате.
            </p>

            <Button
              type="submit"
              form="checkout-form"
              size="lg"
              disabled={!canSubmit}
              className="hidden h-11 w-full lg:flex"
            >
              {submitting ? "Переход к оплате…" : "Оплатить"}
            </Button>
          </aside>
        </div>
      )}
    </div>
  );
}
