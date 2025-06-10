import { type UseTranslationResponse } from "react-i18next";
import { cookies } from "next/headers";
import i18next from "~/app/i18n/i18next";
import { cookieName, defaultLocale } from "~/app/i18n/index";

export async function getTranslation(ns?: string | string[], _options?: unknown) {
  const $cookies = await cookies()
  const lng = $cookies.get(cookieName)?.value ?? defaultLocale
  if (lng && i18next.resolvedLanguage !== lng) {
    await i18next.changeLanguage(lng)
  }
  if (ns && !i18next.hasLoadedNamespace(ns)) {
    await i18next.loadNamespaces(ns)
  }
  return {
    t: i18next.getFixedT(lng ?? i18next.resolvedLanguage, Array.isArray(ns) ? ns[0] : ns),
    i18n: i18next
  } as Pick<UseTranslationResponse<"common", "">, "t" | "i18n">
}