import type { AllowedLocales, I18NConfig } from "~/lib/types";

export const defaultLocale = "de";

export const allowedLocales: AllowedLocales = [defaultLocale, "en"];

export const cookieName = "NEXT_LOCALE";
export const defaultNS = 'translation'

const i18nConfig: I18NConfig = {
  locales: allowedLocales,
  defaultLocale,
  prefixDefault: false, // avoids prefixing the default locale in URLs
};

export { i18nConfig };
