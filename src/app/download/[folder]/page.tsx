import Link from "next/link";

import { LatestPost } from "~/app/_components/post";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import { BaseLayout } from "~/app/_components/BaseLayout";
import { getTranslation } from "~/app/i18n/server";

export default async function DownloadFolder() {
  const supportsBrowsing = await api.user.supportsBrowsing();
  const session = await auth();
  const { t, i18n } = await getTranslation();

  if (!supportsBrowsing) {
    return (
      <HydrateClient>
        <BaseLayout i18n={i18n}>
          <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
            <div className="fail-fast-message">{t("BrowseFilesDisabled")}</div>
          </div>
        </BaseLayout>
      </HydrateClient>
    );
  }

  if (session?.user) {
    void api.user.getLatest.prefetch();
  }

  return (
    <HydrateClient>
      <BaseLayout i18n={i18n}>
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
            Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
          </h1>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-8"></div>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {supportsBrowsing
                ? supportsBrowsing.greeting
                : "Loading tRPC query..."}
            </p>

            <div className="flex flex-col items-center justify-center gap-4">
              <p className="text-center text-2xl text-white">
                {session && <span>Logged in as {session.user?.name}</span>}
              </p>
              <Button asChild>
                <Link
                  href={session ? "/api/auth/signout" : "/api/auth/signin"}
                  className="rounded-full bg-white/10 px-10 py-3 font-semibold no-underline transition hover:bg-white/20"
                >
                  {session ? "Sign out" : "Sign in"}
                </Link>
              </Button>
            </div>
          </div>

          {session?.user && <LatestPost />}
        </div>
      </BaseLayout>
    </HydrateClient>
  );
}
