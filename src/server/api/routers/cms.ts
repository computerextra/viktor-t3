import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { z } from "zod";

type Counts = {
  Abteilungen: number;
  Angebote: number;
  Jobs: number;
  Mitarbeiter: number;
  Partner: number;
};

export const cmsRouter = createTRPCRouter({
  getCounts: publicProcedure.query(async ({ ctx }) => {
    const Abteilungen = await ctx.db.abteilung.aggregate({
      _count: { id: true },
    });
    const Angebote = await ctx.db.angebot.aggregate({
      _count: { id: true },
    });
    const Jobs = await ctx.db.jobs.aggregate({
      _count: { id: true },
    });
    const Mitarbeiter = await ctx.db.mitarbeiter.aggregate({
      _count: { id: true },
    });
    const Partner = await ctx.db.partner.aggregate({
      _count: { id: true },
    });

    const Counts: Counts = {
      Abteilungen: Abteilungen._count.id,
      Angebote: Angebote._count.id,
      Jobs: Jobs._count.id,
      Mitarbeiter: Mitarbeiter._count.id,
      Partner: Partner._count.id,
    };
    return Counts;
  }),
  getAbteilungen: publicProcedure.query(async ({ ctx }) => {
    const Abteilungen = await ctx.db.abteilung.findMany({
      orderBy: { name: "asc" },
    });
    return Abteilungen ?? null;
  }),
  getAbteilung: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const Abteilung = await ctx.db.abteilung.findUnique({
        where: { id: input.id },
      });
      return Abteilung ?? null;
    }),
  createAbteilung: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.abteilung.create({
        data: input,
      });
    }),
  updateAbteilung: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.abteilung.update({
        where: { id: input.id },
        data: input,
      });
    }),
  deleteAbteilung: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.abteilung.delete({ where: { id: input.id } });
    }),
  getAngebote: publicProcedure.query(async ({ ctx }) => {
    const Abteilungen = await ctx.db.angebot.findMany({
      orderBy: { title: "asc" },
    });
    return Abteilungen ?? null;
  }),
  getAngebot: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const Abteilung = await ctx.db.angebot.findUnique({
        where: { id: input.id },
      });
      return Abteilung ?? null;
    }),
  createAngebot: publicProcedure
    .input(
      z.object({
        date_start: z.string(),
        date_stop: z.string(),
        image: z.string(),
        link: z.string().url(),
        title: z.string(),
        subtitle: z.string().optional(),
        anzeigen: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.angebot.create({
        data: {
          ...input,
          date_start: new Date(input.date_start),
          date_stop: new Date(input.date_stop),
        },
      });
    }),
  toggleAngebot: publicProcedure
    .input(z.object({ id: z.string(), mode: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.angebot.update({
        where: { id: input.id },
        data: input,
      });
    }),
  updateAngebot: publicProcedure
    .input(
      z.object({
        id: z.string(),
        date_start: z.string(),
        date_stop: z.string(),
        image: z.string(),
        link: z.string().url(),
        title: z.string(),
        subtitle: z.string().optional(),
        anzeigen: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.angebot.update({
        where: { id: input.id },
        data: {
          ...input,
          date_start: new Date(input.date_start),
          date_stop: new Date(input.date_stop),
        },
      });
    }),
  deleteAngebot: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.angebot.delete({ where: { id: input.id } });
    }),
  getJobs: publicProcedure.query(async ({ ctx }) => {
    const jobs = await ctx.db.jobs.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return jobs ?? null;
  }),
  getJob: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const job = await ctx.db.jobs.findUnique({ where: { id: input.id } });
      return job ?? null;
    }),
  createJob: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.jobs.create({ data: input });
    }),
  updateJob: publicProcedure
    .input(z.object({ id: z.string(), name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.jobs.update({
        where: { id: input.id },
        data: input,
      });
    }),
  deleteJob: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.jobs.delete({
        where: { id: input.id },
      });
    }),
  getMitarbeiters: publicProcedure.query(async ({ ctx }) => {
    const mitarbeiter = await ctx.db.mitarbeiter.findMany({
      orderBy: { name: "asc" },
      include: {
        Abteilung: true,
      },
    });
    return mitarbeiter ?? null;
  }),
  getMitarbeiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const mitarbeiter = await ctx.db.mitarbeiter.findUnique({
        where: { id: input.id },
        include: {
          Abteilung: true,
        },
      });
      return mitarbeiter ?? null;
    }),
  updateMitarbeiter: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        short: z.string().optional(),
        sex: z.string(),
        abteilungId: z.string().optional(),
        image: z.boolean().default(false).optional(),
        Azubi: z.boolean().default(false).optional(),
        focus: z.string().optional(),
        mail: z.string().email().optional(),
        Gruppenwahl: z.string().optional(),
        Geburtstag: z.date().optional(),
        HomeOffice: z.string().optional(),
        Mobil_Business: z.string().optional(),
        Mobil_Privat: z.string().optional(),
        Telefon_Business: z.string().optional(),
        Telefon_Intern_1: z.string().optional(),
        Telefon_Intern_2: z.string().optional(),
        Telefon_Privat: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.mitarbeiter.update({
        where: { id: input.id },
        data: {
          ...input,
          abteilungId:
            input.abteilungId === "x" ? undefined : input.abteilungId,
        },
      });
    }),
  createMitarbeiter: publicProcedure
    .input(
      z.object({
        abteilungId: z.string().optional(),
        Azubi: z.boolean().default(false).optional(),
        focus: z.string().optional(),
        Geburtstag: z.date().optional(),
        Gruppenwahl: z.string().optional(),
        HomeOffice: z.string().optional(),
        image: z.boolean().default(false).optional(),
        sex: z.string(),
        mail: z.string().email().optional(),
        Mobil_Business: z.string().optional(),
        Mobil_Privat: z.string().optional(),
        name: z.string(),
        short: z.string().optional(),
        Telefon_Business: z.string().optional(),
        Telefon_Intern_1: z.string().optional(),
        Telefon_Intern_2: z.string().optional(),
        Telefon_Privat: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.mitarbeiter.create({
        data: {
          ...input,
          abteilungId:
            input.abteilungId === "x" ? undefined : input.abteilungId,
        },
      });
    }),
  deleteMitarbeiter: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.mitarbeiter.delete({ where: { id: input.id } });
    }),
  getPartners: publicProcedure.query(async ({ ctx }) => {
    const partner = await ctx.db.partner.findMany({
      orderBy: {
        name: "asc",
      },
    });
    return partner ?? null;
  }),
  getPartner: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const partner = await ctx.db.partner.findUnique({
        where: { id: input.id },
      });
      return partner ?? null;
    }),
  createPartner: publicProcedure
    .input(
      z.object({
        name: z.string(),
        image: z.string(),
        link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.partner.create({
        data: input,
      });
    }),
  updatePartner: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string(),
        image: z.string(),
        link: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.partner.update({
        where: { id: input.id },
        data: input,
      });
    }),
  deletePartner: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.partner.delete({ where: { id: input.id } });
    }),
});
