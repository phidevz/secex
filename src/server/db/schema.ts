import { relations, sql } from "drizzle-orm";
import { index, primaryKey, sqliteTableCreator } from "drizzle-orm/sqlite-core";
import { type AdapterAccount } from "next-auth/adapters";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = sqliteTableCreator((name) => `secex_${name}`);

export const serverKeys = createTable(
  "server_key",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 256 }),
    privateKey: d.text().notNull(),
    publicKey: d.text().notNull(),
    revocationCertificate: d.text().notNull(),
    fingerprint: d.text({ length: 40 }).notNull(),
    disabled: d.integer({ mode: "boolean" }),
  }),
  (t) => [
    index("server_key_disabled_idx").on(t.disabled),
    index("server_key_name_idx").on(t.name),
    index("server_key_fingerprint_idx").on(t.fingerprint),
  ],
);

export type ServerKeys = typeof serverKeys.$inferSelect;

export const clientKeys = createTable(
  "client_key",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 256 }),
    publicKey: d.text().notNull(),
    fingerprint: d.text({ length: 40 }).notNull(),
    verified: d.integer({ mode: "boolean" }),
    disabled: d.integer({ mode: "boolean" }),
  }),
  (t) => [
    index("client_key_disabled_idx").on(t.disabled),
    index("client_key_name_idx").on(t.name),
    index("client_key_fingerprint_idx").on(t.fingerprint),
  ],
);

export type ClientKeys = typeof clientKeys.$inferSelect;

export const folders = createTable(
  "folder",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 256 }).notNull().unique(),
    description: d.text(),
    download: d.integer({ mode: "boolean" }),
    upload: d.integer({ mode: "boolean" }),
  }),
  (t) => [index("folder_name_idx").on(t.name)],
);

export type Folder = typeof folders.$inferSelect;

export const foldersRelation = relations(folders, ({ many }) => ({
  uploads: many(uploads),
  downloads: many(downloads),
}));

export const uploads = createTable(
  "upload",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 256 }).notNull().unique(),
    envelope: d.blob().notNull(),
    bytes: d.integer().notNull(),
    folderId: d
      .text({ length: 255 })
      .notNull()
      .references(() => folders.id),
    keyId: d.text({ length: 255 }).references(() => clientKeys.id),
  }),
  (t) => [index("upload_name_idx").on(t.name)],
);

export const uploadsRelation = relations(uploads, ({ one }) => ({
  folder: one(folders, {
    fields: [uploads.folderId],
    references: [folders.id],
  }),
  key: one(clientKeys, {
    fields: [uploads.keyId],
    references: [clientKeys.id],
  }),
}));

export const downloads = createTable(
  "download",
  (d) => ({
    id: d
      .text({ length: 255 })
      .notNull()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: d.text({ length: 256 }).notNull().unique(),
    envelope: d.blob().notNull(),
    bytes: d.integer().notNull(),
    uploadedBy: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    folderId: d
      .text({ length: 255 })
      .notNull()
      .references(() => folders.id),
  }),
  (t) => [index("download_name_idx").on(t.name)],
);

export const downloadsRelation = relations(downloads, ({ one }) => ({
  folder: one(folders, {
    fields: [downloads.folderId],
    references: [folders.id],
  }),
  uploadedUser: one(users, {
    fields: [downloads.uploadedBy],
    references: [users.id],
  }),
}));

export const users = createTable("user", (d) => ({
  id: d
    .text({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.text({ length: 255 }),
  email: d.text({ length: 255 }).notNull(),
  emailVerified: d.integer({ mode: "timestamp" }).default(sql`(unixepoch()
                                                              )`),
  image: d.text({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.text({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.text({ length: 255 }).notNull(),
    providerAccountId: d.text({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    token_type: d.text({ length: 255 }),
    scope: d.text({ length: 255 }),
    id_token: d.text(),
    session_state: d.text({ length: 255 }),
  }),
  (t) => [
    primaryKey({
      columns: [t.provider, t.providerAccountId],
    }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.text({ length: 255 }).notNull().primaryKey(),
    userId: d
      .text({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [index("session_userId_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.text({ length: 255 }).notNull(),
    token: d.text({ length: 255 }).notNull(),
    expires: d.integer({ mode: "timestamp" }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);
