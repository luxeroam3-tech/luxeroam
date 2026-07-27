export const CURRENCIES = [
  { code: "USD", label: "US Dollar" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British Pound" },
  { code: "KES", label: "Kenyan Shilling" },
  { code: "TZS", label: "Tanzanian Shilling" },
  { code: "UGX", label: "Ugandan Shilling" },
  { code: "ZAR", label: "South African Rand" },
  { code: "AUD", label: "Australian Dollar" },
  { code: "CAD", label: "Canadian Dollar" },
  { code: "JPY", label: "Japanese Yen" },
  { code: "CNY", label: "Chinese Yuan" },
  { code: "INR", label: "Indian Rupee" },
  { code: "AED", label: "UAE Dirham" },
  { code: "CHF", label: "Swiss Franc" },
  { code: "SEK", label: "Swedish Krona" },
] as const;

export type CurrencyCode = (typeof CURRENCIES)[number]["code"];

export const DEFAULT_CURRENCY: CurrencyCode = "USD";

// Maps a browser-reported region subtag (from navigator.language, e.g. "en-KE" -> "KE")
// to a default currency guess. Falls back to DEFAULT_CURRENCY.
const REGION_TO_CURRENCY: Record<string, CurrencyCode> = {
  KE: "KES",
  TZ: "TZS",
  UG: "UGX",
  ZA: "ZAR",
  GB: "GBP",
  US: "USD",
  CA: "CAD",
  AU: "AUD",
  JP: "JPY",
  CN: "CNY",
  IN: "INR",
  AE: "AED",
  CH: "CHF",
  SE: "SEK",
  FR: "EUR",
  DE: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
};

export function guessCurrencyFromBrowser(
  navigatorLanguage: string,
): CurrencyCode {
  const region = navigatorLanguage.split("-")[1]?.toUpperCase();
  if (region && REGION_TO_CURRENCY[region]) return REGION_TO_CURRENCY[region];
  return DEFAULT_CURRENCY;
}
