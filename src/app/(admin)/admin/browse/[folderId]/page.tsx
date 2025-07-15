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

export default async function BrowseFolder({
  params,
}: {
  params: Promise<{ folderId: string }>;
}) {
  const { folderId } = await params;
  const session = await auth();
  const $folder = await api.admin.browseFolder({ folderId });
  console.log("TEST TEST", $folder);

  if (!$folder) {
    return "Not found";
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {/*<h1 className="text-5xl font-extrabold tracking-tight sm:text-[5rem]">
        Create <span className="text-[hsl(280,100%,70%)]">T3</span> App
      </h1>*/}
      <div className="flex flex-col items-center gap-2">
        <p className="text-2xl text-white">Ordner {$folder.name}</p>

      </div>

      <DataTable data={[]} />
    </div>
  );
}
