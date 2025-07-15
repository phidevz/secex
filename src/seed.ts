import { folders } from "~/server/db/schema";
import { db } from "~/server/db";

await db.insert(folders).values([
  {
    name: "secure-documents",
    description: "Secure Documents",
    upload: true,
    download: true,
  },
  {
    name: "client-files",
    description: "Client-specific encrypted files",

    upload: false,
    download: true,
  },
  {
    name: "upload-staging",

    description: "Temporary staging area for file uploads",

    upload: true,
    download: false,
  },
  {
    name: "archive",
    description: "Archived files for long-term storage",
    upload: false,
    download: false,
  },
]);
