import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

export const einkaufRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const Einkauf = await ctx.db.mitarbeiter.findUnique({
        where: { id: input.id },
        include: { Einkauf: true },
      });

      return Einkauf?.Einkauf ?? null;
    }),
  liste: publicProcedure.query(async ({ ctx }) => {
    process.env.TZ = "Europe/Berlin";

    const Liste = await ctx.db.einkauf.findMany({
      orderBy: { Abgeschickt: "asc" },
      where: {
        OR: [
          {
            AND: [
              {
                Abgeschickt: {
                  lte: new Date(),
                },
              },
              {
                Abgeschickt: {
                  gte: new Date(
                    new Date().getFullYear(),
                    new Date().getMonth(),
                    new Date().getDate(),
                    0,
                    0,
                    0,
                    0,
                  ),
                },
              },
            ],
          },
          {
            AND: [
              {
                Abonniert: true,
              },
              {
                Abgeschickt: {
                  lte: new Date(),
                },
              },
            ],
          },
        ],
      },
      include: {
        Mitarbeiter: true,
      },
    });

    return Liste ?? null;
  }),
  skip: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.einkauf.update({
        where: {
          id: input.id,
        },
        data: {
          Abgeschickt: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            new Date().getDate() + 1,
          ),
        },
      });
    }),
  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.einkauf.update({
        where: { id: input.id },
        data: {
          Abgeschickt: new Date(
            new Date().getFullYear() - 1,
            new Date().getMonth(),
            new Date().getDate(),
          ),
          Abonniert: false,
        },
      });
    }),
  update: publicProcedure
    .input(
      z.object({
        mitarbeiterId: z.string(),
        Abo: z.boolean().optional(),
        Paypal: z.boolean().optional(),
        Dinge: z.string(),
        Geld: z.string().optional(),
        Pfand: z.string().optional(),
        // TODO: Bilder
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.mitarbeiter.update({
        where: {
          id: input.mitarbeiterId,
        },
        data: {
          Einkauf: {
            upsert: {
              create: {
                Abgeschickt: new Date(),
                Dinge: input.Dinge,
                Abonniert: input.Abo,
                Geld: input.Geld,
                Paypal: input.Paypal,
                Pfand: input.Pfand,
              },
              update: {
                Abgeschickt: new Date(),
                Dinge: input.Dinge,
                Abonniert: input.Abo,
                Geld: input.Geld,
                Paypal: input.Paypal,
                Pfand: input.Pfand,
              },
            },
          },
        },
      });
    }),
});
