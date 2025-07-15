import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { eq, or, sql } from "drizzle-orm";
import {
  type Folder,
  folders,
  type ServerKeys,
  serverKeys,
  uploads,
} from "~/server/db/schema";
import {
  type EllipticCurveName,
  generateKey,
  readKey,
  type SerializedKeyPair,
  type UserID,
} from "openpgp";
import { db } from "~/server/db";

export const serverKeyAlgorithm = z.enum([
  "rsa4096",
  "nistP256" satisfies EllipticCurveName,
  "nistP384" satisfies EllipticCurveName,
  "nistP521" satisfies EllipticCurveName,
]);

export type ServerKeyAlgorithm = z.infer<typeof serverKeyAlgorithm>;

export const adminRouter = createTRPCRouter({
  listFolders: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db
      .select({
        id: folders.id,
        name: folders.name,
        description: folders.description,
        download: folders.download,
        upload: folders.upload,
        uploadedFiles: db.$count(uploads, eq(uploads.folderId, folders.id)),
        downloadedFiles: db.$count(uploads, eq(uploads.folderId, folders.id)),
      })
      .from(folders)
      .where(or(eq(folders.upload, true), eq(folders.download, true)));
  }),
  browseFolder: protectedProcedure
    .input(z.object({ folderId: z.string() }))
    .query(async ({ ctx, input }) => {
      return await ctx.db.query.folders.findFirst({
        where: eq(folders.id, input.folderId),
        with: {
          downloads: {
            columns: {
              envelope: false,
            },
          },
          uploads: {
            columns: {
              envelope: false,
            },
          },
        },
      });
    }),

  listServerKeys: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.query.serverKeys.findMany({
      columns: {
        privateKey: false,
      },
    });
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),

  addServerKey: protectedProcedure
    .input(
      z.object({
        algorithm: serverKeyAlgorithm,
        name: z.string().min(1).optional(),
        email: z.string().email().optional(),
        comment: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const passphrase = "TODO"; // TODO replace with something db stored

      const keyUserId = {
        name: input.name,
        email: input.email,
        comment: input.comment,
      } satisfies UserID;

      let key: SerializedKeyPair<string> & { revocationCertificate: string };
      if (input.algorithm === "rsa4096") {
        key = await generateKey({
          type: "rsa",
          rsaBits: 4096,
          passphrase: passphrase,
          userIDs: [keyUserId],
          subkeys: [
            {
              sign: true,
            },
          ],
        });
      } else {
        key = await generateKey({
          type: "ecc",
          curve: input.algorithm,
          passphrase: passphrase,
          userIDs: [keyUserId],
          subkeys: [
            {
              sign: true,
            },
          ],
        });
      }

      const fingerprint = (
        await readKey({ armoredKey: key.publicKey })
      ).getFingerprint();

      const entity = await db
        .insert(serverKeys)
        .values({
          privateKey: key.privateKey,
          publicKey: key.publicKey,
          revocationCertificate: key.revocationCertificate,
          disabled: false,
          fingerprint: fingerprint,
          name: input.name ?? input.email ?? fingerprint,
        })
        .returning({ id: serverKeys.id });

      return {
        id: entity[0]!.id,
        fingerprint,
      };
    }),
});

export type $ListServerKeys = Omit<ServerKeys, "privateKey">[];
export type $ListFolders = (Folder & {
  uploadedFiles: number;
  downloadedFiles: number;
})[];
