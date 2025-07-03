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
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Abteilung } from "viktor/viktor-database-client";
import CmsTable from "../../_components/cms-table";

export default function AbteilungenTable() {
  const router = useRouter();

  const Abteilungen = api.cms.getAbteilungen.useQuery();
  const Löscher = api.cms.deleteAbteilung.useMutation({
    onSuccess: () => {
      router.push("/CMS/Abteilungen");
    },
  });

  if (Abteilungen.isLoading) return <>Loading...</>;
  if (Abteilungen.isFetching) return <>Loading...</>;
  if (Abteilungen.isError) return <>FEHLER!!!</>;

  const columns: ColumnDef<Abteilung>[] = [
    {
      accessorKey: "name",
      header: "Name",
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
                <Link href={"/CMS/Abteilungen/" + x.id}>Bearbeiten</Link>
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
        <Link href="/CMS/Abteilungen/Neu">Neue Abteilung anlegen</Link>
      </Button>
      <CmsTable columns={columns} data={Abteilungen.data ?? []} />
    </div>
  );
}
