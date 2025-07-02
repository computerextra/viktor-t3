import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";

export const mitarbeiterRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const Mitarbeiter = await ctx.db.mitarbeiter.findMany({
      orderBy: { name: "asc" },
    });

    return Mitarbeiter ?? null;
  }),
});
