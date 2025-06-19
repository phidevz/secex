"use client";

import { useTranslation } from "~/app/i18n/client";
import type { Backend } from "~/backend";

export function Heading(
  props: Awaited<ReturnType<Backend["downloadHeader"]>>,
) {
  const { t } = useTranslation();

  return (
    <h2>
      {t("DownloadSingle")}: <code>{props.fileName}</code> ({props.size} bytes)
    </h2>
  );
}
