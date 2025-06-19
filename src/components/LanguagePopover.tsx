"use client";

import type { i18n } from "i18next";
import { Button } from "~/components/ui/button";
import { useCookies } from "next-client-cookies";
import { useCallback } from "react";
import type { Locale } from "~/lib/types";
import { cookieName } from "~/app/i18n";

export function LanguagePopover(props: { i18n: i18n }) {
  const { i18n } = props;
  const cookies = useCookies();

  const changeLanguage = useCallback(
    async function (language: Locale) {
      cookies.set(cookieName, language);
      await i18n.changeLanguage(language);
      if(typeof window !== "undefined"){
        window.document.body.parentElement!.setAttribute("lang", language);
      }
    },
    [cookies, i18n],
  );

  return (
    <div className="flex flex-col gap-4">
      <Button
        variant="outline"
        onClick={async () => await changeLanguage("de")}
      >
        <div className="language">
          <img
            height={16}
            width={27}
            alt="Flag of Germany"
            src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Flag_of_Germany.svg"
          />
          <span>Deutsch</span>
        </div>
      </Button>
      <Button
        variant="outline"
        onClick={async () => await changeLanguage("en")}
      >
        <div className="language">
          <img
            height={16}
            width={27}
            alt="Flag of the United Kingdom"
            src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Flag_of_the_United_Kingdom_%281-2%29.svg"
          />
          <span>English</span>
        </div>
      </Button>
    </div>
  );
}
