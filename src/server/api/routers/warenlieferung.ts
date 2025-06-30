import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { Warenlieferung } from "@prisma/client";
import { Decimal } from "@prisma/client/runtime/library";
import * as db from "mssql";
import nodemailer from "nodemailer";

const sqlConfig: db.config = {
  user: env.SAGE_USER,
  password: env.SAGE_PASS,
  database: env.SAGE_DB,
  server: env.SAGE_SERVER,
  port: env.SAGE_PORT,
  options: {
    encrypt: false, // for azure
    trustServerCertificate: true, // change to true for local dev / self-signed certs
  },
};

type SG_AUF_ARTIKEL = {
  SG_AUF_ARTIKEL_PK: number;
  ARTNR?: string;
  SUCHBEGRIFF?: string;
};

type History = {
  Id: number;
  Action: string;
};

type Price = {
  Id: number;
  Action: string;
  Price: number;
};

export const warenlieferungRouter = createTRPCRouter({
  generate: publicProcedure.mutation(async ({ ctx }) => {
    const AlleArtikel = await ctx.db.warenlieferung.findMany();

    //TODO: Generate Warenlieferung
    const res = new db.ConnectionPool(sqlConfig);
    await res.connect();

    const SageArtikel = (await res.query(
      "SELECT SG_AUF_ARTIKEL_PK, ARTNR, SUCHBEGRIFF FROM sg_auf_artikel",
    )) as unknown as SG_AUF_ARTIKEL[];

    const LagerHistory = (await res.query(
      "SELECT SG_AUF_ARTIKEL_FK, Hist_Action FROM sg_auf_lager_history WHERE BEWEGUNG >= 0 AND BEMERKUNG LIKE 'Warenlieferung:%' AND convert(varchar, Hist_Datetime, 105) = convert(varchar, getdate(), 105)",
    )) as unknown as History[];

    const Prices = (await res.query(
      "SELECT Hist_Action, SG_AUF_ARTIKEL_FK, PR01 FROM sg_auf_vkpreis_history WHERE convert(varchar, Hist_Datetime, 105) = convert(varchar, getdate(), 105)",
    )) as unknown as Price[];

    await res.close();

    const NeueArtikel: Warenlieferung[] = [];
    const GelieferteArtikel: Warenlieferung[] = [];
    const Geliefert: number[] = [];
    const NeuePreise: Warenlieferung[] = [];

    if (AlleArtikel.length <= 0) {
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      SageArtikel.forEach(async (x) => {
        const y = await ctx.db.warenlieferung.create({
          data: {
            id: x.SG_AUF_ARTIKEL_PK,
            Artikelnummer: x.ARTNR ?? "",
            Name: x.SUCHBEGRIFF ?? "",
          },
        });
        NeueArtikel.push(y);
      });
    } else {
      LagerHistory.forEach((x) => {
        if (x.Action == "Insert") {
          Geliefert.push(x.Id);
        }
      });
      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      SageArtikel.forEach(async (x) => {
        let found = false;
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        Geliefert.forEach(async (y) => {
          if (x.SG_AUF_ARTIKEL_PK == y) {
            const z = await ctx.db.warenlieferung.update({
              data: {
                geliefert: new Date(),
              },
              where: {
                id: x.SG_AUF_ARTIKEL_PK,
              },
            });
            GelieferteArtikel.push(z);
          }
        });

        AlleArtikel.map((y) => {
          if (x.SG_AUF_ARTIKEL_PK == y.id) {
            found = true;
            return;
          }
        });

        if (!found) {
          const neu = await ctx.db.warenlieferung.create({
            data: {
              id: x.SG_AUF_ARTIKEL_PK,
              Artikelnummer: x.ARTNR ?? "",
              Name: x.SUCHBEGRIFF ?? "",
            },
          });
          NeueArtikel.push(neu);
        }
      });

      Prices.map((x) => {
        let found = false;
        let idx = 0;
        let temp: Warenlieferung | undefined = undefined;

        if (NeuePreise.length > 0) {
          for (let i = 0; i < NeuePreise.length; i++) {
            if (NeuePreise[i]?.id == x.Id) {
              found = true;
              temp = NeuePreise[i];
              idx = i;
            }
          }
        }

        if (!found) {
          temp = {
            id: x.Id,
            Preis: new Date(),
            angelegt: new Date(),
            Name: "",
            Artikelnummer: "",
            geliefert: null,
            AlterPreis: null,
            NeuerPreis: null,
          };
        }
        if (temp == null) return;

        if (x.Action == "Insert") {
          temp.NeuerPreis = new Decimal(x.Price);
        }
        if (x.Action == "Delete") {
          temp.AlterPreis = new Decimal(x.Price);
        }
        if (idx > 0) {
          let altFloat: Decimal = new Decimal(0);
          let neuFloat: Decimal = new Decimal(0);
          if (temp?.AlterPreis != null) {
            altFloat = temp.AlterPreis;
          }
          if (altFloat > new Decimal(0)) {
            NeuePreise[idx]!.AlterPreis = temp.AlterPreis;
          }
          if (temp?.NeuerPreis != null) {
            neuFloat = temp.NeuerPreis;
          }
          if (neuFloat > new Decimal(0)) {
            NeuePreise[idx]!.NeuerPreis = temp.NeuerPreis;
          }
        } else {
          NeuePreise.push(temp);
        }
      });
    }

    //   for i := range neueArtikel {
    // 	_, err := queries.InsertWarenlieferung(ctx, db.InsertWarenlieferungParams{
    // 		ID:            neueArtikel[i].ID,
    // 		Name:          neueArtikel[i].Name,
    // 		Artikelnummer: neueArtikel[i].Artikelnummer,
    // 	})
    // 	if err != nil {
    // 		fehler := err.Error()
    // 		return fehler
    // 	}
    // }
    // for i := range geliefert {
    // 	_, err := queries.UpdateWarenlieferung(ctx, db.UpdateWarenlieferungParams{
    // 		Name: geliefert[i].Name,
    // 		ID:   geliefert[i].ID,
    // 	})
    // 	if err != nil {
    // 		fehler := err.Error()
    // 		return fehler
    // 	}
    // }
    // for i := range neuePreise {
    // 	var altFloat float64
    // 	var neuFloat float64
    // 	if neuePreise[i].Alterpreis.Valid {
    // 		altFloat, _ = strconv.ParseFloat(neuePreise[i].Alterpreis.String, 64)
    // 	}
    // 	if neuePreise[i].Neuerpreis.Valid {
    // 		neuFloat, _ = strconv.ParseFloat(neuePreise[i].Neuerpreis.String, 64)
    // 	}
    // 	if neuFloat > 0 && altFloat > 0 && altFloat != neuFloat {
    // 		_, err := queries.UpdatePreisWarenlieferung(ctx, db.UpdatePreisWarenlieferungParams{
    // 			Alterpreis: neuePreise[i].Alterpreis,
    // 			Neuerpreis: neuePreise[i].Neuerpreis,
    // 			ID:         neuePreise[i].ID,
    // 		})
    // 		if err != nil {
    // 			fehler := err.Error()
    // 			return fehler
    // 		}
    // 	}

    // }
  }),
  send: publicProcedure.mutation(async ({ ctx }) => {
    const mitarbeiter = await ctx.db.mitarbeiter.findMany({
      where: {
        NOT: {
          mail: null,
        },
      },
    });

    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    // TODO: Create HTML Mail
    const body = "";

    let mails = "";

    for (let i = 0; i < mitarbeiter.length; i++) {
      if (mitarbeiter[i]?.mail != null) {
        mails += mitarbeiter[i]?.mail;
        if (i < mitarbeiter.length - 1) {
          mails += ", ";
        }
      }
    }

    const res = await transporter.sendMail({
      from: env.SMTP_FROM,
      to: mails,
      subject: "Warenlieferung vom " + new Date().toLocaleDateString(),
      text: body,
      html: body,
    });

    return res.messageId;
  }),
});
