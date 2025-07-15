import Link from "next/link";

import * as React from "react";
import { auth } from "~/server/auth";
import { api, HydrateClient } from "~/trpc/server";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import {
  CircleCheckIcon,
  DownloadIcon,
  EditIcon,
  EllipsisVerticalIcon,
  EyeIcon,
  FolderIcon,
  FolderPlusIcon,
  LoaderIcon,
  MoreVerticalIcon,
  PlusIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";

import { DataTable } from "~/components/DataTable";
import { ServerKeysCard } from "~/components/ServerKeysCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Folders } from "~/components/Folders";

import { stat, realpath } from "fs/promises";

export default async function Home() {
  const hello = await api.user.hello({ text: "from tRPC" });
  const session = await auth();
  const $serverKeys = await api.admin.listServerKeys();
  const $folders = await api.admin.listFolders();
  console.log("TEST TEST", await realpath("."));

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {/*<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
      </h1>*/}
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl text-white">
          {hello ? hello.greeting : "Loading tRPC query..."}
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
      <div className="flex flex-row gap-4">
        <ServerKeysCard serverKeys={$serverKeys} />
        <Card>
          <CardHeader>
            <CardDescription>Nutzer GPG Schlüssel</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              2 (1)
            </CardTitle>
            <CardAction>
              {/*<Badge variant="outline">
                +12.5%
              </Badge>*/}
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Trending up this month
            </div>
            <div className="text-muted-foreground">
              Visitors for the last 6 months
            </div>
          </CardFooter>
        </Card>
      </div>

      <Folders folders={$folders} />
    </div>
  );
}
