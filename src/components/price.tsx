"use client";

import { useI18n } from "@/lib/i18n/context";

/**
 * Prices are stored in USD; render them through the i18n context so they follow
 * the visitor's currency like the rest of the site.
 */
export function Price({ amount }: { amount: number }) {
  const { formatPrice } = useI18n();
  return <>{formatPrice(amount)}</>;
}
