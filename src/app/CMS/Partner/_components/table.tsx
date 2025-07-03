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
import { MoreHorizontal } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Partner } from "viktor/viktor-database-client";
import CmsTable from "../../_components/cms-table";

export default function PartnerTable() {
  const router = useRouter();

  const Abteilungen = api.cms.getPartners.useQuery();
  const Löscher = api.cms.deletePartner.useMutation({
    onSuccess: () => {
      router.push("/CMS/Partner");
    },
  });

  if (Abteilungen.isLoading) return <>Loading...</>;
  if (Abteilungen.isFetching) return <>Loading...</>;
  if (Abteilungen.isError) return <>FEHLER!!!</>;

  const columns: ColumnDef<Partner>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "image",
      header: "Bild",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>{x.image}</TooltipTrigger>
              <TooltipContent align="start">
                <div className="h-[250px] w-[250px] bg-white">
                  <Image
                    src={"https://computer-extra.de/Images/Partner/" + x.image}
                    alt={x.image}
                    width={250}
                    height={250}
                  />
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
    },
    {
      accessorKey: "link",
      header: "Link",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <a
            href={x.link}
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            {x.link}
          </a>
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
                <Link href={"/CMS/Partner/" + x.id}>Bearbeiten</Link>
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
        <Link href="/CMS/Partner/Neu">Neuen Partner anlegen</Link>
      </Button>
      <CmsTable columns={columns} data={Abteilungen.data ?? []} />
    </div>
  );
}
