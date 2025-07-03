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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { api } from "@/trpc/react";
import type { ColumnDef } from "@tanstack/react-table";
import { Check, Cross, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Angebot } from "viktor/viktor-database-client";
import CmsTable from "../../_components/cms-table";

const No = () => <Cross className="h-4 w-4 rotate-45 text-red-500" />;
const Yes = () => <Check className="h-4 w-4 text-green-500" />;

export default function AngeboteTable() {
  const router = useRouter();
  const utils = api.useUtils();

  const Abteilungen = api.cms.getAngebote.useQuery();
  const Löscher = api.cms.deleteAngebot.useMutation({
    onSuccess: () => {
      router.push("/CMS/Angebote");
    },
  });
  const toggler = api.cms.toggleAngebot.useMutation({
    onSuccess: async () => {
      await utils.cms.invalidate();
    },
  });

  if (Abteilungen.isLoading) return <>Loading...</>;
  if (Abteilungen.isFetching) return <>Loading...</>;
  if (Abteilungen.isError) return <>FEHLER!!!</>;

  const columns: ColumnDef<Angebot>[] = [
    {
      accessorKey: "title",
      header: "Titel",
    },
    {
      accessorKey: "subtitle",
      header: "Sub Title",
    },
    {
      accessorKey: "link",
      header: "URL",
      cell: ({ row }) => {
        const x = row.original;
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[200px] overflow-hidden">
                  <Link className="text-ellipsis" href={x.link}>
                    {x.link}
                  </Link>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p> {x.link}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "date_start",
      header: "Start",
      cell: ({ row }) => {
        const x = row.original;
        return (
          <>
            {x.date_start.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </>
        );
      },
    },
    {
      accessorKey: "date_stop",
      header: "Ende",
      cell: ({ row }) => {
        const x = row.original;
        return (
          <>
            {x.date_stop.toLocaleDateString("de-DE", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </>
        );
      },
    },
    {
      accessorKey: "image",
      header: "Bild",
    },
    {
      accessorKey: "anzeigen",
      header: "Online",
      cell: ({ row }) => {
        const x = row.original;
        return <>{x.anzeigen ? <Yes /> : <No />}</>;
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
                <Link href={"/CMS/Angebote/" + x.id}>Bearbeiten</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={async () => {
                  await toggler.mutateAsync({ id: x.id, mode: !x.anzeigen });
                }}
              >
                Toggle Online
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
        <Link href="/CMS/Angebote/Neu">Neues Angebot anlegen</Link>
      </Button>
      <CmsTable columns={columns} data={Abteilungen.data ?? []} />
    </div>
  );
}
