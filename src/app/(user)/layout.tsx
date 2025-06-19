import type { PropsWithChildren } from "react";
import { HydrateClient } from "~/trpc/server";
import { BaseLayout } from "~/components/BaseLayout";

export default function DownloadLayout(props: PropsWithChildren) {
  return (
    <HydrateClient>
      <BaseLayout>{props.children}</BaseLayout>
    </HydrateClient>
  );
}
