"use client";

import dynamic from "next/dynamic";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

import {
  formatCityLabel,
  type UseWebDeliveryReturn,
} from "./use-web-delivery";

const PvzMap = dynamic(() => import("@/components/checkout/pvz-map"), {
  ssr: false,
});

export type WebDeliveryFieldsProps = {
  delivery: UseWebDeliveryReturn;
  /** Prefixed ids to avoid collisions when both checkout and dialog exist. */
  idPrefix?: string;
  /** Compact map height for modal use. */
  mapClassName?: string;
  className?: string;
  showDeliverySum?: boolean;
};

/**
 * Shared CDEK city / door|PVZ / address / calc UI for checkout and one-click buy.
 */
export function WebDeliveryFields({
  delivery,
  idPrefix = "checkout",
  mapClassName,
  className,
  showDeliverySum = false,
}: WebDeliveryFieldsProps) {
  const {
    cityQuery,
    onCityQueryChange,
    citySuggestions,
    cityLookupState,
    selectedCity,
    selectCity,
    deliveryType,
    setDeliveryType,
    pvzList,
    selectedPvz,
    setSelectedPvz,
    pvzView,
    setPvzView,
    calc,
    calcLoading,
    streetQuery,
    onStreetQueryChange,
    streetSuggestions,
    streetLookupState,
    selectStreetSuggestion,
    flat,
    setFlat,
    selectedTariff,
  } = delivery;

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-2">
        <label
          htmlFor={`${idPrefix}-city`}
          className="text-body text-text-secondary"
        >
          Город доставки
        </label>
        <Input
          id={`${idPrefix}-city`}
          value={cityQuery}
          onChange={(e) => onCityQueryChange(e.target.value)}
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
              onClick={() => setDeliveryType("pvz")}
            >
              До ПВЗ
            </Button>
          </div>

          {deliveryType === "door" ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <label
                  htmlFor={`${idPrefix}-street`}
                  className="text-body text-text-secondary"
                >
                  Улица и дом
                </label>
                <Input
                  id={`${idPrefix}-street`}
                  value={streetQuery}
                  onChange={(e) => onStreetQueryChange(e.target.value)}
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
                  htmlFor={`${idPrefix}-flat`}
                  className="text-body text-text-secondary"
                >
                  Квартира / офис
                </label>
                <Input
                  id={`${idPrefix}-flat`}
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
                    <div className={cn("min-h-[240px]", mapClassName)}>
                      <PvzMap
                        points={pvzList}
                        selectedCode={selectedPvz?.code ?? null}
                        onSelect={setSelectedPvz}
                      />
                    </div>
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
          {showDeliverySum && selectedTariff ? (
            <p className="text-body text-text-heading">
              Доставка: {formatPrice(selectedTariff.deliverySum)}
              {selectedTariff.periodMin > 0
                ? ` · ${selectedTariff.periodMin}–${selectedTariff.periodMax} дн.`
                : null}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
