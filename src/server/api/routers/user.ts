import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { posts } from "~/server/db/schema";
import { env } from "~/env";

export const userRouter = createTRPCRouter({
  hello: publicProcedure
    .input(z.object({ text: z.string() }))
    .query(({ input }) => {
      return {
        greeting: `Hello ${input.text}`,
      };
    }),

  supportsBrowsing: publicProcedure.query(({ ctx }) => {
    return env.SECEX_ENABLE_BROWSE_FILES;
  }),

  testDownload: publicProcedure
    .input(z.object({ folder: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.backend.testDownload(input.folder);
    }),

  testFile: publicProcedure
    .input(z.object({ folder: z.string().min(1), file: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      return await ctx.backend.testFile(input.folder, input.file);
    }),

  getLatest: protectedProcedure.query(async ({ ctx }) => {
    const post = await ctx.db.query.posts.findFirst({
      orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    });

    return post ?? null;
  }),

  getSecretMessage: protectedProcedure.query(() => {
    return "you can now see this secret message!";
  }),
});
