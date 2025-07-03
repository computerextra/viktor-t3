"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Globe, GraduationCap, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Abteilung, Mitarbeiter } from "viktor/viktor-database-client";
import CmsTable from "../../_components/cms-table";

export default function MitarbeiterTable() {
  const router = useRouter();

  const Abteilungen = api.cms.getMitarbeiters.useQuery();
  const Löscher = api.cms.deleteMitarbeiter.useMutation({
    onSuccess: () => {
      router.push("/CMS/Mitarbeiter");
    },
  });

  if (Abteilungen.isLoading) return <>Loading...</>;
  if (Abteilungen.isFetching) return <>Loading...</>;
  if (Abteilungen.isError) return <>FEHLER!!!</>;

  const columns: ColumnDef<Mitarbeiter & { Abteilung: Abteilung | null }>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <p className="flex items-center gap-2">
            {x.Azubi && <GraduationCap className="h-4 w-4" />}
            {x.mail && <Globe className="h-4 w-4" />}
            {x.name}
          </p>
        );
      },
    },
    {
      accessorKey: "mail",
      header: "Mail",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <a className="underline" href={"mailto:" + x.mail}>
            {x.mail}
          </a>
        );
      },
    },
    {
      accessorKey: "Abteilung.name",
      header: "Abteilung",
    },
    {
      accessorKey: "Geburtstag",
      header: "Geburtstag",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <p>
            {x.Geburtstag?.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
            })}
          </p>
        );
      },
    },
    {
      accessorKey: "Gruppenwahl",
      header: "Intern",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <div>
            <p>Gruppe: {x.Gruppenwahl}</p>
            <p>Intern: {x.Telefon_Intern_1}</p>
            <p>Intern 2: {x.Telefon_Intern_2}</p>
            <p>Homeoffice: {x.HomeOffice}</p>
          </div>
        );
      },
    },
    {
      accessorKey: "Telefon_Privat",
      header: "Extern",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <div>
            <p>
              FN Privat:{" "}
              <a className="underline" href={"tel:" + x.Telefon_Privat}>
                {x.Telefon_Privat}
              </a>
            </p>
            <p>
              FN Busi:{" "}
              <a className="underline" href={"tel:" + x.Telefon_Business}>
                {x.Telefon_Business}
              </a>
            </p>
            <p>
              Mob Privat:{" "}
              <a className="underline" href={"tel:" + x.Mobil_Privat}>
                {x.Mobil_Privat}
              </a>
            </p>
            <p>
              Mob Busi:{" "}
              <a className="underline" href={"tel:" + x.Mobil_Business}>
                {x.Mobil_Business}
              </a>
            </p>
          </div>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="noShadow" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <Link href={"/CMS/Mitarbeiter/" + x.id}>Bearbeiten</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await Löscher.mutateAsync({ id: x.id });
                }}
              >
                Löschen
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="mt-5">
      <Button asChild className="mb-5">
        <Link href="/CMS/Mitarbeiter/Neu">Neuen Mitarbeiter anlegen</Link>
      </Button>
      <p className="mb-2">
        Icon Legende: <br />
        <span className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />: Azubi
        </span>
        <span className="flex items-center gap-2">
          <Globe className="h-4 w-4" />: Auf Webseite angezeigt
        </span>
      </p>
      <CmsTable columns={columns} data={Abteilungen.data ?? []} />
    </div>
  );
}
