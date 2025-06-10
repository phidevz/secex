import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import resourcesToBackend from 'i18next-resources-to-backend'
import { initReactI18next } from 'react-i18next/initReactI18next'
import { defaultLocale, allowedLocales, defaultNS } from './index'
import type { Locale } from "~/lib/types";

const runsOnServerSide = typeof window === 'undefined'

void i18next
  .use(initReactI18next)
  .use(LanguageDetector)
  .use(resourcesToBackend((language: Locale, namespace: string) => import(`~/app/i18n/translations/${language}/common.json`)))
  .init({
    // debug: true,
    supportedLngs: allowedLocales,
    fallbackLng: defaultLocale,
    lng: undefined, // let detect the language on client side
    fallbackNS: defaultNS,
    defaultNS,
    detection: {
      order: ['cookie', 'navigator']
    },
    preload: runsOnServerSide ? allowedLocales : [],
    // backend: {
    //   projectId: '01b2e5e8-6243-47d1-b36f-963dbb8bcae3'
    // }
  })

export default i18next