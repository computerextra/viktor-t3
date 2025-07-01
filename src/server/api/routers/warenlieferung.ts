import { env } from "@/env";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import type { Warenlieferung } from "@prisma/client";
import nodemailer from "nodemailer";

export const warenlieferungRouter = createTRPCRouter({
  generate: publicProcedure.mutation(async ({ ctx }) => {
    const AlleArtikel = await ctx.db.warenlieferung.findMany();

    const SageArtikel = await ctx.sage.sg_auf_artikel.findMany({});

    const LagerHistory = await ctx.sage.sg_auf_lager_history.findMany({
      where: {
        AND: [
          {
            BEWEGUNG: { gte: 0 },
          },
          {
            BEMERKUNG: {
              contains: "Warenlieferung:",
            },
          },
          {
            Hist_Datetime: {
              lte: new Date(),
            },
          },
          {
            Hist_Datetime: {
              gt: new Date(
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
    });

    const Prices = await ctx.sage.sg_auf_vkpreis_history.findMany({
      where: {
        AND: [
          {
            Hist_Datetime: { lte: new Date() },
          },
          {
            Hist_Datetime: {
              gt: new Date(
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
    });

    const newArtikel: Warenlieferung[] = [];
    const gelieferteIds: number[] = [];
    const newPrices: {
      id: number;
      newPrice: number;
      oldPrice: number;
    }[] = [];

    if (AlleArtikel.length <= 0) {
      SageArtikel.forEach((x) => {
        if (x.ARTNR && x.SUCHBEGRIFF)
          newArtikel.push({
            id: x.SG_AUF_ARTIKEL_PK,
            Artikelnummer: x.ARTNR,
            Name: x.SUCHBEGRIFF,
            angelegt: new Date(),
            AlterPreis: null,
            geliefert: null,
            NeuerPreis: null,
            Preis: null,
          });
      });

      await ctx.db.warenlieferung.createMany({
        data: newArtikel,
        skipDuplicates: true,
      });
    } else {
      SageArtikel.forEach((x) => {
        let found = false;

        AlleArtikel.map((y) => {
          if (x.SG_AUF_ARTIKEL_PK == y.id) {
            found = true;
          }
        });

        if (!found) {
          if (x.ARTNR && x.SUCHBEGRIFF)
            newArtikel.push({
              id: x.SG_AUF_ARTIKEL_PK,
              Artikelnummer: x.ARTNR,
              Name: x.SUCHBEGRIFF,
              angelegt: new Date(),
              AlterPreis: null,
              geliefert: null,
              NeuerPreis: null,
              Preis: null,
            });
        }
      });

      LagerHistory.forEach((x) => {
        if (x.Hist_Action == "Insert") {
          if (x.SG_AUF_ARTIKEL_FK) gelieferteIds.push(x.SG_AUF_ARTIKEL_FK);
        }
      });

      Prices.map((x) => {
        let found = false;

        AlleArtikel.forEach((y) => {
          if (x.SG_AUF_ARTIKEL_FK == y.id) {
            newPrices.push({
              id: y.id,
              newPrice: 0,
              oldPrice: 0,
            });
            found = true;
          }
        });

        if (found) {
          if (x.Hist_Action == "Insert") {
            const search = newPrices.find((t) => t.id == x.SG_AUF_ARTIKEL_FK);
            if (search != null) {
              if (x.PR01) search.newPrice = x.PR01;
            }
          }
          if (x.Hist_Action == "Delete") {
            const search = newPrices.find((t) => t.id == x.SG_AUF_ARTIKEL_FK);
            if (search != null) {
              if (x.PR01) search.oldPrice = x.PR01;
            }
          }
        }
      });

      await ctx.db.warenlieferung.createMany({
        data: newArtikel,
        skipDuplicates: true,
      });

      await ctx.db.warenlieferung.updateMany({
        where: {
          id: {
            in: gelieferteIds,
          },
        },
        data: {
          geliefert: new Date(),
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-misused-promises
      newPrices.forEach(async (x) => {
        if (x.newPrice > 0 && x.oldPrice > 0) {
          await ctx.db.warenlieferung.update({
            where: {
              id: x.id,
            },
            data: {
              NeuerPreis: x.newPrice,
              AlterPreis: x.newPrice,
            },
          });
        }
      });
    }
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

    const yesterday = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
      0,
      0,
      0,
      0,
    );
    const NeueArtikel = await ctx.db.warenlieferung.findMany({
      where: {
        angelegt: {
          lte: new Date(),
          gt: yesterday,
        },
      },
      orderBy: {
        Artikelnummer: "asc",
      },
    });
    const GelieferteArtikel = await ctx.db.warenlieferung.findMany({
      where: {
        AND: [
          {
            angelegt: { lte: yesterday },
          },
          {
            geliefert: {
              lte: new Date(),
              gt: yesterday,
            },
          },
        ],
      },
      orderBy: {
        Artikelnummer: "asc",
      },
    });
    const NeuePreise = await ctx.db.warenlieferung.findMany({
      where: {
        Preis: {
          lte: new Date(),
          gt: yesterday,
        },
      },
      orderBy: {
        Artikelnummer: "asc",
      },
    });

    let wertBestand = 0;
    let werVerfügbar = 0;

    const Bestände = await ctx.sage.sg_auf_artikel.findMany({
      where: {
        BESTAND: { gt: 0 },
      },
    });

    const TeureArtikel = await ctx.sage.$queryRaw<
      {
        ARTNR?: string;
        SUCHBEGRIFF?: string;
        BESTAND?: number;
        EKPR01?: number;
        Summe?: number;
      }[]
    >`SELECT TOP 10 ARTNR, SUCHBEGRIFF, BESTAND, EKPR01, BESTAND * EKPR01 as Summe FROM sg_auf_artikel WHERE BESTAND > 0 ORDER BY Summe DESC`;

    const TeureVerfügbareArtikel = await ctx.sage.$queryRaw<
      {
        ARTNR?: string;
        SUCHBEGRIFF?: string;
        BESTAND?: number;
        VERFUEGBAR?: number;
        EKPR01?: number;
        Summe?: number;
      }[]
    >`SELECT TOP 10 ARTNR, SUCHBEGRIFF, BESTAND, VERFUEGBAR, EKPR01, VERFUEGBAR * EKPR01 as Summe FROM sg_auf_artikel WHERE VERFUEGBAR > 0 ORDER BY Summe DESC`;

    const Leichen = await ctx.sage.sg_auf_artikel.findMany({
      take: 20,
      where: {
        VERFUEGBAR: { gt: 0 },
      },
      orderBy: {
        LetzterUmsatz: "asc",
      },
    });

    const SeriennummernRes = await ctx.sage.$queryRaw<
      {
        ARTNR?: string;
        SUCHBEGRIFF?: string;
        BESTAND?: number;
        VERFUEGBAR?: number;
        GE_Beginn?: Date;
      }[]
    >`SELECT sg_auf_artikel.ARTNR, sg_auf_artikel.SUCHBEGRIFF, sg_auf_artikel.BESTAND, sg_auf_artikel.VERFUEGBAR, sg_auf_snr.GE_Beginn FROM sg_auf_artikel INNER JOIN sg_auf_snr ON sg_auf_artikel.SG_AUF_ARTIKEL_PK = sg_auf_snr.SG_AUF_ARTIKEL_FK  WHERE sg_auf_artikel.VERFUEGBAR > 0 AND sg_auf_snr.SNR_STATUS != 2 AND sg_auf_snr.GE_Beginn <= DATEADD(month, DATEDIFF(month, 0, DATEADD(MONTH,-1,GETDATE())), 0) ORDER BY sg_auf_snr.GE_Beginn`;

    const Seriennummern: typeof SeriennummernRes = [];

    SeriennummernRes.forEach((x) => {
      const found = Seriennummern.findIndex((a) => a.ARTNR == x.ARTNR);
      if (found == -1) {
        Seriennummern.push(x);
      }
    });

    const OffeneAuftrage = await ctx.sage.sg_auf_fschrift.findMany({
      where: {
        AND: [
          {
            NOT: {
              FORTGEFUEHRT: 1,
            },
          },
          {
            OR: [
              {
                ERFART: {
                  contains: "02AU",
                },
              },
              {
                ERFART: {
                  contains: "03LI",
                },
              },
            ],
          },
        ],
      },
    });

    type Verbrecher = {
      Auftrag: string;
      Wert: number;
      Verbrecher: string;
      Datum: Date;
      Kunde: string;
    };

    const Verbrecher: Verbrecher[] = [];
    let Gesamtwert = 0;

    for (const x of OffeneAuftrage) {
      const nr = x?.AUFNR;
      if (nr != null) {
        const res = await ctx.sage.sg_auf_fschrift.findMany({
          where: {
            ALTAUFNR: {
              contains: nr,
            },
          },
        });

        if (res.length < 1) {
          Verbrecher.push({
            Auftrag: x.AUFNR ?? "",
            Wert: x.ENDPRB ?? 0,
            Verbrecher: x.VERTRETER ?? "",
            Datum: x.DATUM ?? new Date(),
            Kunde: x.NAME ?? "",
          });
          if (x.ENDPRB != null) {
            Gesamtwert += x.ENDPRB;
          }
        } else {
          if (!res[0]?.ERFART?.includes("04RE")) {
            Verbrecher.push({
              Auftrag: x.AUFNR ?? "",
              Wert: x.ENDPRB ?? 0,
              Verbrecher: x.VERTRETER ?? "",
              Datum: x.DATUM ?? new Date(),
              Kunde: x.NAME ?? "",
            });
            if (x.ENDPRB != null) {
              Gesamtwert += x.ENDPRB;
            }
          }
        }
      }
    }

    Bestände.forEach((x) => {
      if (x.BESTAND && x.EKPR01) {
        wertBestand += x.EKPR01 * x.BESTAND;
      }
      if (x.VERFUEGBAR && x.EKPR01) {
        werVerfügbar += x.EKPR01 * x.VERFUEGBAR;
      }
    });

    let body = `<h1>Warenlieferung vom ${new Date().toLocaleDateString(
      "de-DE",
      {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      },
    )}</h1>`;

    if (NeueArtikel.length > 0) {
      body += "<br><br><h2>Neue Artikel</h2><ul>";
      NeueArtikel.forEach((x) => {
        body += `<li><b>${x.Artikelnummer}</b> - ${x.Name}</li>`;
      });
      body += "</ul>";
    }

    if (GelieferteArtikel.length > 0) {
      body += "<br><br><h2>Gelieferte Artikel</h2><ul>";
      GelieferteArtikel.forEach((x) => {
        body += `<li><b>${x.Artikelnummer}</b> - ${x.Name}</li>`;
      });
      body += "</ul>";
    }

    if (NeuePreise.length > 0) {
      body += "<br><br><h2>Preisänderungen</h2><ul>";
      NeuePreise.forEach((x) => {
        if (x.AlterPreis && x.NeuerPreis && x.AlterPreis != x.NeuerPreis) {
          const alterPreis = x.AlterPreis.toFixed(2);
          const neuerPreis = x.NeuerPreis.toFixed(2);
          const absolute = x.AlterPreis.sub(x.NeuerPreis).toNumber();
          const prozent = x.AlterPreis.div(x.NeuerPreis).toNumber() * 100 - 100;
          body += `<li><b>${x.Artikelnummer}</b> - ${x.Name}: ${alterPreis} ➡️ ${neuerPreis} (${absolute}€ // ${prozent}%)</li>`;
        }
      });
      body += "</ul>";
    }

    body += "<br><br>";
    body += "<h2>Aktuelle Lagerwerte</h2>";
    body +=
      "<p><b>Lagerwert Verfügbare Artikel:</b> " +
      werVerfügbar.toFixed(2) +
      "€</p>";
    body +=
      "<p><b>Lagerwert alle lagernde Artikel:</b> " +
      wertBestand.toFixed(2) +
      "€</p>";
    body +=
      "<p>Wert in aktuellen Aufträgen: " +
      (wertBestand - werVerfügbar).toFixed(2) +
      " €</p>";
    body +=
      "<p>Offene Posten laut Sage: " +
      // TODO: Wert ist 0!
      Gesamtwert.toFixed(2) +
      "€* (Hier kann nicht nach bereits lagernder Ware gesucht werden!)</p>";

    if (Seriennummern.length > 0) {
      body += "<br><br>";
      body += "<h2>Artikel mit alten Seriennummern</h2>";
      body +=
        "<p>Nachfolgende Artikel sollten mit erhöhter Priorität verkauft werden, da die Seriennummern bereits sehr alt sind. Gegebenenfalls sind die Artikel bereits außerhalb der Herstellergarantie!</p>";
      body += "<p>Folgende Werte gelten:</p>";
      body +=
        "<p>Wortmann: Angebene Garantielaufzeit + 2 Monate ab Kaufdatum CompEx</p>";
      body += "<p>Lenovo: Angegebene Garantielaufzeit ab Kauf CompEx</p>";
      body +=
        "<p>Bei allen anderen Herstellern gilt teilweise das Kaufdatum des Kunden. <br>Falls sich dies ändern sollte, wird es in der Aufzählung ergänzt.</p>";
      body += "<p>Erklärungen der Farben:</p>";
      body +=
        "<p><span style='background-color: \"#f45865\"'>ROT:</span> Artikel ist bereits seit mehr als 2 Jahren lagernd und sollte schnellstens Verkauft werden!</p>";
      body +=
        "<p><span style='background-color: \"#fff200\"'>Gelb:</span> Artikel ist bereits seit mehr als 1 Jahr lagernd!</p>";

      body += "<br>";
      body += "<br>";

      body += "<table><thead><tr>";
      body += "<th>Artikelnummer</th>";
      body += "<th>Name</th>";
      body += "<th>Bestand</th>";
      body += "<th>Verfügbar</th>";
      body += "<th>Garantiebeginn des ältesten Artikels</th>";
      body += "</tr></thead><tbody>";
      Seriennummern.forEach((x) => {
        if (x.GE_Beginn) {
          const year = new Date().getFullYear();
          const diff = year - x.GE_Beginn.getFullYear();
          const Garantiebeginn = x.GE_Beginn.toLocaleDateString("de-DE", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          });

          if (diff >= 2) {
            body += `<tr style='background-color: "#f45865"'>`;
          } else if (diff >= 1) {
            body += `<tr style='background-color: "#fff200"'>`;
          } else {
            body += "<tr>";
          }
          body += `<td>${x.ARTNR}</td>`;
          body += `<td>${x.SUCHBEGRIFF}</td>`;
          body += `<td>${x.BESTAND}</td>`;
          body += `<td>${x.VERFUEGBAR}</td>`;
          body += `<td>${Garantiebeginn}</td>`;
          body += "</tr>";
        }
      });
      body += "</tbody></table>";
    }

    if (TeureArtikel.length > 0) {
      body += "<br>";
      body += "<br>";
      body +=
        "<h2>Top 10: Die teuersten Artikel inkl. aktive Aufträge</h2><table><thead><tr><th>Artikelnummer</th><th>Name</th><th>Bestand</th><th>Einzelpreis</th><th>Summe</th></tr></thead><tbody>";

      TeureArtikel.forEach((x) => {
        body += `<tr><td>${x.ARTNR}</td><td>${x.SUCHBEGRIFF}</td><td>${x.BESTAND}</td><td>${x.EKPR01?.toFixed(2)} €</td><td>${x.Summe?.toFixed(2)} €</td></tr>`;
      });
      body += "</tbody></table>";
    }

    if (TeureVerfügbareArtikel.length > 0) {
      body += "<br>";
      body += "<br>";

      body +=
        "<h2>Top 10: Die teuersten Artikel exkl. aktive Aufträge</h2><table><thead><tr><th>Artikelnummer</th><th>Name</th><th>Bestand</th><th>Einzelpreis</th><th>Summe</th></tr></thead><tbody>";

      TeureVerfügbareArtikel.forEach((x) => {
        body += `<tr><td>${x.ARTNR}</td><td>${x.SUCHBEGRIFF}</td><td>${x.BESTAND}</td><td>${x.EKPR01?.toFixed(2)} €</td><td>${x.Summe?.toFixed(2)} €</td></tr>`;
      });
      body += "</tbody></table>";
    }

    if (Leichen.length > 0) {
      body += "<br>";
      body += "<br>";

      body +=
        "<h2>Top 20: Leichen bei CE</h2><table><thead><tr><th>Artikelnummer</th><th>Name</th><th>Bestand</th><th>Verfügbar</th><th>Letzter Umsatz:</th><th>Wert im Lager:</th></tr></thead><tbody>";

      Leichen.forEach((x) => {
        if (x.EKPR01 && x.VERFUEGBAR) {
          const summe = (x.EKPR01 * x.VERFUEGBAR).toFixed(2);
          if (x.LetzterUmsatz) {
            let letzerUmsatz = x.LetzterUmsatz.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });
            if (letzerUmsatz == "30.12.1899") letzerUmsatz = "nie";

            body += `<tr><td>${x.ARTNR}</td><td>${x.SUCHBEGRIFF}</td><td>${x.BESTAND}</td><td>${x.VERFUEGBAR}</td><td>${letzerUmsatz}</td><td>${summe}€</td></tr>`;
          }
        }
      });
      body += "</tbody></table>";
    }

    if (Verbrecher.length > 0) {
      body += "<br>";
      body += "<br>";
      body +=
        "<h2>Aktuell offene Aufträge & Lieferscheine (Es können Leichen dabei sein, das lässt sich leider nicht korrekt filtern)</h2><table><thead><tr><th>Auftrag</th><th>Summe Brutto</th><th>Vertreter</th><th>Kundenname</th><th>Datum</th></tr></thead><tbody>";

      Verbrecher.forEach((x) => {
        const date = x.Datum.toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        });
        body += `<tr><td>${x.Auftrag}</td><td>${x.Wert.toFixed(2)}</td><td>${x.Verbrecher}</td><td>${x.Kunde}</td><td>${date}</td></tr>`;
      });
      body += "</tbody></table>";
    }

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
      // TODO: Uncomment!
      // to: mails,
      to: "johannes.kirchner@computer-extra.de",
      subject:
        "Warenlieferung vom " +
        new Date().toLocaleDateString("de-DE", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
      text: body,
      html: body,
    });

    return res.messageId;
  }),
});
