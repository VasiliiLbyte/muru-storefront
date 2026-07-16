"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import {
  calculateCdekWeb,
  getCdekAddressSuggestions,
  getCdekCities,
  getCdekPvz,
} from "@/lib/api/endpoints";
import { cityNameForAddressSuggest } from "@/lib/checkout/city-name-for-address";
import type {
  AddressSuggestion,
  CdekCalcResult,
  CdekCity,
  CdekPvz,
} from "@/lib/schemas";

export type WebDeliveryCalcItem = { sku: string; quantity: number };

export type CdekPayloadFields = {
  deliveryOption: string;
  address: string;
  deliveryEta: string;
  cdekTariffCode: number;
  cdekCityCode: number;
  cdekCityName: string;
  cdekPvzCode: string | null;
  cdekPvzAddress: string | null;
};

export function formatCdekEta(option: CdekCalcResult["door"]): string {
  if (!option || option.periodMin <= 0) return "";
  return `${option.periodMin}–${option.periodMax} дн.`;
}

export function formatCityLabel(city: CdekCity): string {
  const name = (city.city || city.full_name || "").trim();
  if (!name) return `Город ${city.code}`;
  if (city.region) return `${name} (${city.region})`;
  return city.full_name.trim() || name;
}

export function useWebDelivery(items: WebDeliveryCalcItem[]) {
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
  const [streetSuggestions, setStreetSuggestions] = useState<
    AddressSuggestion[]
  >([]);
  const [streetLookupState, setStreetLookupState] = useState<
    "idle" | "loading" | "empty" | "error"
  >("idle");
  const [selectedStreetValue, setSelectedStreetValue] = useState("");
  const [flat, setFlat] = useState("");

  const itemsKey = useMemo(
    () =>
      items
        .map((i) => `${i.sku}:${i.quantity}`)
        .sort()
        .join(","),
    [items],
  );

  const houseAddress = useMemo(() => {
    const street = selectedStreetValue.trim() || streetQuery.trim();
    if (!street) return "";
    const flatTrimmed = flat.trim();
    return flatTrimmed ? `${street}, кв ${flatTrimmed}` : street;
  }, [selectedStreetValue, streetQuery, flat]);

  const selectedTariff = deliveryType === "pvz" ? calc?.pvz : calc?.door;

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
      if (items.length === 0) return;
      setCalcLoading(true);
      calculateCdekWeb({
        toCityCode: selectedCity.code,
        items,
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
    // itemsKey tracks items content without unstable array identity
    // eslint-disable-next-line react-hooks/exhaustive-deps -- items via itemsKey
  }, [selectedCity, deliveryType, itemsKey]);

  const selectStreetSuggestion = useCallback((suggestion: AddressSuggestion) => {
    setSelectedStreetValue(suggestion.value);
    setStreetQuery(suggestion.value);
    setStreetSuggestions([]);
    setStreetLookupState("idle");
    if (suggestion.flat) setFlat(suggestion.flat);
  }, []);

  const selectCity = useCallback((city: CdekCity) => {
    setSelectedCity(city);
    setCityQuery(city.full_name);
    setCitySuggestions([]);
    setCityLookupState("idle");
    setSelectedPvz(null);
    setCalc(null);
  }, []);

  const onCityQueryChange = useCallback(
    (value: string) => {
      setCityQuery(value);
      if (selectedCity && value !== selectedCity.full_name) {
        setSelectedCity(null);
      }
    },
    [selectedCity],
  );

  const onStreetQueryChange = useCallback(
    (value: string) => {
      setStreetQuery(value);
      if (selectedStreetValue && value !== selectedStreetValue) {
        setSelectedStreetValue("");
      }
    },
    [selectedStreetValue],
  );

  const setDeliveryTypeAndReset = useCallback((type: "door" | "pvz") => {
    setDeliveryType(type);
    if (type === "pvz") setPvzView("map");
  }, []);

  const deliveryValid =
    !!selectedCity &&
    !!selectedTariff &&
    (deliveryType === "door"
      ? (selectedStreetValue.trim() || streetQuery.trim()).length >= 3
      : !!selectedPvz);

  const cdekPayloadFields = useCallback((): CdekPayloadFields | null => {
    if (!selectedCity || !selectedTariff) return null;

    const address =
      deliveryType === "pvz"
        ? selectedPvz
          ? `${selectedCity.full_name}, ПВЗ: ${selectedPvz.address}`
          : selectedCity.full_name
        : houseAddress
          ? `${selectedCity.full_name}, ${houseAddress}`
          : selectedCity.full_name;

    return {
      deliveryOption:
        deliveryType === "pvz" ? `PVZ:${selectedPvz?.code ?? ""}` : "DOOR",
      address,
      deliveryEta: formatCdekEta(selectedTariff),
      cdekTariffCode: selectedTariff.tariffCode,
      cdekCityCode: selectedCity.code,
      cdekCityName: selectedCity.full_name,
      cdekPvzCode: deliveryType === "pvz" ? (selectedPvz?.code ?? null) : null,
      cdekPvzAddress:
        deliveryType === "pvz" ? (selectedPvz?.address ?? null) : null,
    };
  }, [
    selectedCity,
    selectedTariff,
    deliveryType,
    selectedPvz,
    houseAddress,
  ]);

  return {
    cityQuery,
    onCityQueryChange,
    citySuggestions,
    cityLookupState,
    selectedCity,
    selectCity,
    deliveryType,
    setDeliveryType: setDeliveryTypeAndReset,
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
    deliveryValid,
    cdekPayloadFields,
  };
}

export type UseWebDeliveryReturn = ReturnType<typeof useWebDelivery>;
