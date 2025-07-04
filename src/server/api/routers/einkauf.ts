import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { unlink } from "fs/promises";
import path from "path";
import { z } from "zod";

export const einkaufRouter = createTRPCRouter({
  getImage: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const Mitarbeiter = await ctx.db.mitarbeiter.findUnique({
        where: {
          id,
        },
      });
      if (Mitarbeiter == null) return null;
      if (Mitarbeiter.einkaufId == null) return null;

      const image = await ctx.db.einkauf.findFirst({
        where: { id: Mitarbeiter.einkaufId },
        select: {
          Bild1: true,
          Bild2: true,
          Bild3: true,
        },
      });
      return image ?? null;
    }),
  uploadImage: publicProcedure
    .input(
      z.object({
        id: z.string(),
        imageNr: z.number().int().min(1).max(3),
        imageName: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id, imageNr, imageName } = input;

      const Mitarbeiter = await ctx.db.mitarbeiter.findUnique({
        where: {
          id,
        },
      });
      if (Mitarbeiter == null) return null;
      let einkaufId = "";
      if (Mitarbeiter.einkaufId == null) {
        const einkauf = await ctx.db.einkauf.create({
          data: {
            Abgeschickt: "",
            Dinge: "",
            Mitarbeiter: {
              connect: {
                id: id,
              },
            },
          },
        });
        einkaufId = einkauf.id;
      } else {
        einkaufId = Mitarbeiter.einkaufId;
      }

      switch (imageNr) {
        case 1: {
          return await ctx.db.einkauf.update({
            where: {
              id: einkaufId,
            },
            data: {
              Bild1: imageName,
            },
          });
        }
        case 2: {
          return await ctx.db.einkauf.update({
            where: {
              id: einkaufId,
            },
            data: {
              Bild2: imageName,
            },
          });
        }
        case 3: {
          return await ctx.db.einkauf.update({
            where: {
              id: einkaufId,
            },
            data: {
              Bild3: imageName,
            },
          });
        }
      }
    }),
  deleteImage: publicProcedure
    .input(z.object({ id: z.string(), nr: z.number().int().min(1).max(3) }))
    .mutation(async ({ ctx, input }) => {
      const Mitarbeiter = await ctx.db.mitarbeiter.findUnique({
        where: { id: input.id },
        include: { Einkauf: true },
      });

      if (Mitarbeiter == null) return;
      if (Mitarbeiter.einkaufId == null) return;
      const uploadPath = path.join(process.cwd() + "/public", "/images");
      switch (input.nr) {
        case 1: {
          await unlink(path.join(uploadPath, Mitarbeiter.Einkauf!.Bild1!));
          return await ctx.db.einkauf.update({
            where: {
              id: Mitarbeiter.einkaufId,
            },
            data: {
              Bild1: null,
            },
          });
        }
        case 2: {
          await unlink(path.join(uploadPath, Mitarbeiter.Einkauf!.Bild2!));
          return await ctx.db.einkauf.update({
            where: {
              id: Mitarbeiter.einkaufId,
            },
            data: {
              Bild2: null,
            },
          });
        }
        case 3: {
          await unlink(path.join(uploadPath, Mitarbeiter.Einkauf!.Bild3!));
          return await ctx.db.einkauf.update({
            where: {
              id: Mitarbeiter.einkaufId,
            },
            data: {
              Bild3: null,
            },
          });
        }
      }
    }),
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
