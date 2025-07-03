"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import { useEffect, useState } from "react";

type Geburtstag = {
  Name: string;
  Geburtstag: Date;
};

export default function GeburtstagsListe() {
  const Mitarbeiter = api.mitarbeiter.getAll.useQuery();

  const [heute, setHeute] = useState<undefined | Geburtstag[]>(undefined);
  const [zukünftige, setZukünftige] = useState<undefined | Geburtstag[]>(
    undefined,
  );
  const [vergangene, setVergangene] = useState<undefined | Geburtstag[]>(
    undefined,
  );

  useEffect(() => {
    if (Mitarbeiter.data == null) return;
    const heute: Geburtstag[] = [];
    const zukunft: Geburtstag[] = [];
    const vergangen: Geburtstag[] = [];

    for (const ma of Mitarbeiter.data) {
      if (ma.Geburtstag != null) {
        const today = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          new Date().getDate(),
        );
        const temp = new Date(
          new Date().getFullYear(),
          ma.Geburtstag.getMonth(),
          ma.Geburtstag.getDate(),
        );
        if (today == temp) heute.push({ Name: ma.name, Geburtstag: temp });
        if (temp.getTime() > today.getTime())
          zukunft.push({ Name: ma.name, Geburtstag: temp });
        if (temp.getTime() < today.getTime())
          vergangen.push({ Name: ma.name, Geburtstag: temp });
      }
      if (heute.length > 0)
        heute.sort((a, b) => a.Geburtstag.getTime() - b.Geburtstag.getTime());
      if (zukunft.length > 0)
        zukunft.sort((a, b) => a.Geburtstag.getTime() - b.Geburtstag.getTime());
      if (vergangen.length > 0)
        vergangen.sort(
          (a, b) => a.Geburtstag.getTime() - b.Geburtstag.getTime(),
        );

      setHeute(heute);
      setVergangene(vergangen);
      setZukünftige(zukunft);
    }
  }, [Mitarbeiter.data]);

  const getDiff = (date: Date): number => {
    const today = new Date(
      new Date().getFullYear(),
      new Date().getMonth(),
      new Date().getDate(),
    );
    const temp = new Date(
      new Date().getFullYear(),
      date.getMonth(),
      date.getDate(),
    );
    const diffTime = Math.abs(today.getTime() - temp.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div>
      {heute?.map((x) => (
        <Alert className="my-5" key={x.Name}>
          <AlertTitle>Heute hat Geburtstag:</AlertTitle>
          <AlertDescription>{x.Name}</AlertDescription>
        </Alert>
      ))}
      <h3 className="text-foreground text-center text-xl">
        Zukünftige Geburtstage
      </h3>
      <Table className="mb-5">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Geburtstag am</TableHead>

            <TableHead className="text-right">Noch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {zukünftige?.map((x) => (
            <TableRow key={x.Name}>
              <TableCell className="font-base">{x.Name}</TableCell>
              <TableCell>
                {x.Geburtstag.toLocaleDateString("de-de", {
                  day: "2-digit",
                  month: "long",
                })}
              </TableCell>

              <TableCell className="text-right">
                In {getDiff(x.Geburtstag)} Tagen
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <h3 className="text-foreground text-center text-xl">
        Vergangene Geburtstage
      </h3>
      <Table className="mb-5">
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Geburtstag am</TableHead>

            <TableHead className="text-right">Noch</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {vergangene?.map((x) => (
            <TableRow key={x.Name}>
              <TableCell className="font-base">{x.Name}</TableCell>
              <TableCell>
                {x.Geburtstag.toLocaleDateString("de-de", {
                  day: "2-digit",
                  month: "long",
                })}
              </TableCell>

              <TableCell className="text-right">
                Vor {getDiff(x.Geburtstag)} Tagen
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
