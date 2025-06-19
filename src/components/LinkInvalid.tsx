"use client";

import { useTranslation } from "~/app/i18n/client";

export function LinkInvalid() {
  const { t } = useTranslation();

  return (
      <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
        <div className="fail-fast-message">{t("LinkInvalid")}</div>
      </div>
  );
}