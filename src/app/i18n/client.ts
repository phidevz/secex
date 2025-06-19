'use client'

import i18next from "~/app/i18n/i18next";
import { useCookies } from 'next-client-cookies';
import { useEffect, useState } from 'react'
import { useTranslation as $useTranslation, type UseTranslationOptions } from "react-i18next";
import { cookieName, defaultLocale } from "~/app/i18n/index";

const runsOnServerSide = typeof window === 'undefined'

export function useTranslation(ns?: string | string[], _options?: UseTranslationOptions<''>) {
  const lng = useCookies().get()[cookieName] ?? defaultLocale
  if (runsOnServerSide && i18next.resolvedLanguage !== lng) {
    void i18next.changeLanguage(lng)
  } else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const [activeLng, setActiveLng] = useState(i18next.resolvedLanguage)
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (activeLng === i18next.resolvedLanguage) {
        return;
      }
      setActiveLng(i18next.resolvedLanguage)
    }, [activeLng, i18next.resolvedLanguage])
    // eslint-disable-next-line react-hooks/rules-of-hooks
    useEffect(() => {
      if (!lng || i18next.resolvedLanguage === lng) return
      void i18next.changeLanguage(lng)
    }, [lng, i18next])
  }
  return $useTranslation(ns, _options);
}