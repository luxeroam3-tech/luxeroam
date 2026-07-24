"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  LOCALES,
  DEFAULT_LOCALE,
  guessLocaleFromBrowser,
  type LocaleCode,
} from "@/lib/i18n/locales";
import {
  DEFAULT_CURRENCY,
  guessCurrencyFromBrowser,
  type CurrencyCode,
} from "@/lib/i18n/currencies";
import en from "@/lib/i18n/messages/en.json";
import fr from "@/lib/i18n/messages/fr.json";
import sw from "@/lib/i18n/messages/sw.json";

const MESSAGES: Record<LocaleCode, Record<string, unknown>> = { en, fr, sw };

function getNested(obj: Record<string, unknown>, path: string): string {
  const value = path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        typeof acc === "object" && acc !== null
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj
    );
  return typeof value === "string" ? value : path;
}

type I18nContextValue = {
  locale: LocaleCode;
  setLocale: (locale: LocaleCode) => void;
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  t: (key: string) => string;
  formatPrice: (usdAmount: number) => string;
  ratesLoading: boolean;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const LOCALE_STORAGE_KEY = "luxeroam:locale";
const CURRENCY_STORAGE_KEY = "luxeroam:currency";

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocaleCode>(DEFAULT_LOCALE);
  const [currency, setCurrencyState] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [rates, setRates] = useState<Record<string, number> | null>(null);
  const [ratesLoading, setRatesLoading] = useState(true);

  useEffect(() => {
    const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY) as
      | LocaleCode
      | null;
    const savedCurrency = localStorage.getItem(
      CURRENCY_STORAGE_KEY
    ) as CurrencyCode | null;

    if (savedLocale && LOCALES.some((l) => l.code === savedLocale)) {
      setLocaleState(savedLocale);
    } else {
      setLocaleState(guessLocaleFromBrowser(navigator.language));
    }

    if (savedCurrency) {
      setCurrencyState(savedCurrency);
    } else {
      setCurrencyState(guessCurrencyFromBrowser(navigator.language));
    }

    fetch("/api/rates")
      .then((res) => res.json())
      .then((data) => {
        if (data.rates) setRates(data.rates);
      })
      .finally(() => setRatesLoading(false));
  }, []);

  function setLocale(next: LocaleCode) {
    setLocaleState(next);
    localStorage.setItem(LOCALE_STORAGE_KEY, next);
  }

  function setCurrency(next: CurrencyCode) {
    setCurrencyState(next);
    localStorage.setItem(CURRENCY_STORAGE_KEY, next);
  }

  const value = useMemo<I18nContextValue>(() => {
    function t(key: string) {
      return getNested(MESSAGES[locale] ?? MESSAGES.en, key);
    }

    function formatPrice(usdAmount: number) {
      const rate = rates?.[currency] ?? 1;
      const converted = usdAmount * rate;
      try {
        return new Intl.NumberFormat(undefined, {
          style: "currency",
          currency,
          maximumFractionDigits: converted >= 100 ? 0 : 2,
        }).format(converted);
      } catch {
        return `${currency} ${converted.toFixed(0)}`;
      }
    }

    return { locale, setLocale, currency, setCurrency, t, formatPrice, ratesLoading };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale, currency, rates, ratesLoading]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
