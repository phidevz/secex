import { api } from "~/trpc/server";
import { LinkInvalid } from "~/components/LinkInvalid";
import { Suspense } from "react";
import { Heading } from "~/app/(user)/download/[folder]/[file]/_components/Heading";
import { cn } from "~/lib/utils";
import Page from "~/app/(user)/download/[folder]/[file]/_components/Page";

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

  if (!isValid) {
    return <LinkInvalid />;
  }

  const armoredKeys = await api.user.getVerificationKeys();
  const fileHeader = await api.user.downloadHeader({
    folder: folder,
    file: file,
  });

  return (
    <div className="mx-auto mb-auto flex w-full max-w-[var(--max-width)] flex-col gap-8">
      <Heading {...fileHeader} />
      <Suspense
        fallback={
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={cn("animate-spin")}
          >
            <path d="M21 12a9 9 0 1 1-6.219-8.56" />
          </svg>
        }
      >
        <Page
          folder={folder}
          file={file}
          serverKeys={armoredKeys}
        />
      </Suspense>
    </div>
  );
}
