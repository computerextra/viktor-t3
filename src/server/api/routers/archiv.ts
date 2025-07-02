import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

import { z } from "zod";

export const archivRouter = createTRPCRouter({
  search: publicProcedure
    .input(z.object({ search: z.string().min(3) }))
    .mutation(async ({ ctx, input }) => {
      const results = await ctx.db.pdfs.findMany({
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
});
