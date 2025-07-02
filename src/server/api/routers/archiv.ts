import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { readFile } from "fs/promises";
import { join } from "path";

import { z } from "zod";

export const archivRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ search: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.db.pdfs.findMany({
        select: {
          id: true,
          title: true,
        },
        where: {
          OR: [
            {
              title: { contains: input.search },
            },
            {
              body: { contains: input.search },
            },
          ],
        },
      });
      return results ?? null;
    }),
  get: publicProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const filename = await ctx.db.pdfs.findUnique({
        where: {
          id: input.id,
        },
        select: {
          title: true,
        },
      });
      if (filename == null) return null;

      const file = await readFile(join(env.ARCHIVE_PATH, filename.title));
      const b64 = Buffer.from(file).toString("base64");
      return b64 ?? null;
    }),
});
