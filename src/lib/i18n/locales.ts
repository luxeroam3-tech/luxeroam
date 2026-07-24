export const LOCALES = [
  { code: "en", label: "English", region: "United States" },
  { code: "fr", label: "Français", region: "France" },
  { code: "sw", label: "Kiswahili", region: "Kenya" },
] as const;

export type LocaleCode = (typeof LOCALES)[number]["code"];

export const DEFAULT_LOCALE: LocaleCode = "en";

// Maps a browser-reported region subtag (from navigator.language, e.g. "en-KE" -> "KE")
// to one of our supported locales. Falls back to DEFAULT_LOCALE.
const REGION_TO_LOCALE: Record<string, LocaleCode> = {
  KE: "sw",
  TZ: "sw",
  UG: "sw",
  FR: "fr",
  BE: "fr",
  CH: "fr",
  CA: "fr",
};

export function guessLocaleFromBrowser(navigatorLanguage: string): LocaleCode {
  const region = navigatorLanguage.split("-")[1]?.toUpperCase();
  if (region && REGION_TO_LOCALE[region]) return REGION_TO_LOCALE[region];
  const lang = navigatorLanguage.split("-")[0]?.toLowerCase();
  const match = LOCALES.find((l) => l.code === lang);
  return match?.code ?? DEFAULT_LOCALE;
}
