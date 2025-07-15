import type { PropsWithChildren } from "react";
import { HydrateClient } from "~/trpc/server";
import { AdminLayout } from "~/components/AdminLayout";
import { auth } from "~/server/auth";
import { redirect } from "next/navigation";

export default async function DownloadLayout(props: PropsWithChildren) {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  if (!isLoggedIn) {
    return redirect("/api/auth/signin");
  }

  return (
    <HydrateClient>
      <AdminLayout isLoggedIn={isLoggedIn}>{props.children}</AdminLayout>
    </HydrateClient>
  );
}
