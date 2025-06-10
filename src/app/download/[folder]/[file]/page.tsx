import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { DownloadFilePage } from "~/x-pages";
import { BaseLayout } from "~/app/_components/BaseLayout";
import { getTranslation } from "~/app/i18n/server";

export default async function DownloadFile({
  params,
}: {
  params: Promise<{ folder: string; file: string }>;
}) {
  const { folder, file } = await params;
  const isValid = await api.user.testFile({
    folder: folder,
    file: file,
  });
  const session = await auth();
  const { t, i18n } = await getTranslation();

  return (
    <HydrateClient>
      <BaseLayout i18n={i18n}>
        <DownloadFilePage isValid={isValid} folder={folder} file={file} />
      </BaseLayout>
    </HydrateClient>
  );
}
