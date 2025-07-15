"use client";

import * as React from "react";
import {
  DownloadIcon,
  EditIcon,
  EyeIcon,
  FolderIcon,
  FolderPlusIcon,
  FoldersIcon,
  MoreVerticalIcon,
  Trash2Icon,
  UploadIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Card,
  CardTitle,
  CardContent,
  CardHeader,
  CardFooter,
  CardDescription,
  CardAction,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useState } from "react";
import type { $ListFolders } from "~/server/api/routers/admin";
import Link from "next/link";

export function Folders(props: { folders: $ListFolders }) {
  const { folders } = props;
console.log("folders", folders);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  return (
    <div className="space-y-6">
      {/* Download Folders Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="flex items-center gap-2 text-2xl font-semibold">
              <FoldersIcon className="text-primary h-6 w-6" />
              Folders
            </h2>
            <p className="text-muted-foreground">
              Manage folders containing files available for upload and/or
              download
            </p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <FolderPlusIcon className="h-4 w-4" />
            Create Folder
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {folders.map((folder) => (
            <Card
              key={folder.id}
              className="bg-card border-border overflow-hidden"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-lg font-medium">
                    <FolderIcon className="h-5 w-5 text-blue-500" />
                    <Link href={`/admin/browse/${folder.id}`} className="hover:underline">{folder.name}</Link>
                  </CardTitle>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVerticalIcon className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleViewFolder(folder)}>
                      <EyeIcon className="mr-2 h-4 w-4" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleEditFolder(folder)}>
                      <EditIcon className="mr-2 h-4 w-4" />
                      Edit Folder
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDeleteFolder(folder.id, folder.name)}
                      className="text-destructive"
                    >
                      <Trash2Icon className="mr-2 h-4 w-4" />
                      Delete Folder
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-muted-foreground text-sm">
                  {folder.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div
                    className={cn("flex gap-2", {
                      "text-muted-foreground": !folder.download,
                    })}
                  >
                    <DownloadIcon className="h-5" />
                    <span>Download {folder.download ? "aktiv" : "inaktiv"}</span>
                  </div>
                  <div
                    className={cn("flex gap-2", {
                      "text-muted-foreground": !folder.upload,
                    })}
                  >
                    <UploadIcon className="h-5" />
                    <span>Upload {folder.upload ? "aktiv" : "inaktiv"}</span>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Badge variant={"secondary"} className="w-full justify-center">
                  <div className="flex w-full justify-between px-2 text-sm">
                    <div className="">{folder.uploadedFiles + folder.downloadedFiles} File(s)</div>
                    <div>{folder.totalSize}</div>
                  </div>
                </Badge>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
