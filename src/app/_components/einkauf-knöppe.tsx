"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/trpc/react";
import Link from "next/link";
import { useState } from "react";

export default function EinkaufKnöppe() {
  return (
    <div className="mb-5 grid grid-cols-2 gap-8">
      <EingabeKnopp />

      <Button onClick={() => window.print()}>Drucken</Button>
    </div>
  );
}

function EingabeKnopp() {
  const Mitarbeiter = api.mitarbeiter.getAll.useQuery();

  const [auswahl, setAuswahl] = useState<string | undefined>(undefined);

  if (Mitarbeiter.isLoading) return <>Lädt...</>;
  if (Mitarbeiter.isFetching) return <>Lädt...</>;
  if (Mitarbeiter.isError) return <>FEHLER!</>;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button>Eingabe</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Auswahl</AlertDialogTitle>
          <AlertDialogDescription>
            <Select onValueChange={(e) => setAuswahl(e)}>
              <SelectTrigger>
                <SelectValue placeholder="Mitarbeiter" />
              </SelectTrigger>
              <SelectContent>
                {Mitarbeiter.data?.map((x) => (
                  <SelectItem key={x.id} value={x.id}>
                    {x.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction asChild>
            <Link href={"/Einkauf/" + auswahl}>
              {auswahl == null || auswahl.length < 1
                ? "Niemand ausgewählt"
                : "Eingeben"}
            </Link>
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
