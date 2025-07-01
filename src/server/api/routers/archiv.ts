import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { readdir, readFile } from "fs/promises";
import { join } from "path";
import { PdfReader } from "pdfreader";
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
  sync: publicProcedure.mutation(async ({ ctx }) => {
    const files = await readdir(env.ARCHIVE_PATH);
    const newPdfs: { title: string; body: string }[] = [];

    const oldPdfs = await ctx.db.pdfs.findMany();

    for (const x of files) {
      if (oldPdfs.find((y) => y.title == x) == null) {
        const buff = await readFile(join(env.ARCHIVE_PATH, x));

        const reader = new PdfReader();
        reader.parseBuffer(buff, (e, i) => {
          if (e) console.error("error:", e);
          else if (!i) console.warn("end of file");
          else if (i.text) {
            newPdfs.push({
              title: x,
              body: i.text,
            });
          }
        });
      }
    }

    await ctx.db.pdfs.createMany({
      data: newPdfs,
    });
  }),
});
