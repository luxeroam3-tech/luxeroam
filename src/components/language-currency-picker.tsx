"use client";

import { useState } from "react";
import { useI18n } from "@/lib/i18n/context";
import { LOCALES } from "@/lib/i18n/locales";
import { CURRENCIES } from "@/lib/i18n/currencies";
import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

type Tab = "language" | "currency";

export function LanguageCurrencyPicker({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { locale, setLocale, currency, setCurrency, t, ratesLoading } =
    useI18n();
  const [tab, setTab] = useState<Tab>("language");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {tab === "language"
              ? t("picker.languageAndRegion")
              : t("picker.currency")}
          </SheetTitle>
        </SheetHeader>

        <div className="flex gap-2 border-b border-border px-4 pb-3">
          <button
            type="button"
            onClick={() => setTab("language")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              tab === "language"
                ? "bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {t("picker.languageAndRegion")}
          </button>
          <button
            type="button"
            onClick={() => setTab("currency")}
            className={cn(
              "rounded-full px-4 py-1.5 text-sm font-medium",
              tab === "currency"
                ? "bg-foreground text-background"
                : "hover:bg-muted",
            )}
          >
            {t("picker.currency")}
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 py-3">
          {tab === "language" && (
            <div className="flex flex-col gap-1">
              <div className="mb-1 text-xs font-medium text-muted-foreground">
                {t("picker.chooseLanguage")}
              </div>
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  type="button"
                  onClick={() => setLocale(l.code)}
                  className={cn(
                    "rounded-lg border p-3 text-left hover:bg-muted",
                    locale === l.code ? "border-foreground" : "border-border",
                  )}
                >
                  <div className="text-sm font-medium">{l.label}</div>
                  <div className="text-xs text-muted-foreground">
                    {l.region}
                  </div>
                </button>
              ))}
            </div>
          )}

          {tab === "currency" && (
            <div className="flex flex-col gap-1">
              <div className="mb-1 flex items-center justify-between text-xs font-medium text-muted-foreground">
                <span>{t("picker.chooseCurrency")}</span>
                {ratesLoading && <span>Loading rates…</span>}
              </div>
              {CURRENCIES.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => setCurrency(c.code)}
                  className={cn(
                    "rounded-lg border p-3 text-left hover:bg-muted",
                    currency === c.code ? "border-foreground" : "border-border",
                  )}
                >
                  <div className="text-sm font-medium">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.code}</div>
                </button>
              ))}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
