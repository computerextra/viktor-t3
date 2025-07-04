"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Check, Cross } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Einkauf, Mitarbeiter } from "viktor/viktor-database-client";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

const No = () => <Cross className="h-4 w-4 rotate-45 text-red-500" />;
const Yes = () => <Check className="h-4 w-4 text-green-500" />;

export default function EinkaufListe() {
  const Liste = api.einkauf.liste.useQuery();

  if (Liste.isFetching) return <>Lädt ...</>;
  if (Liste.isLoading) return <>Lädt ...</>;
  if (Liste.isError) return <>FEHLER!!!</>;

  const columns: ColumnDef<Einkauf & { Mitarbeiter: Mitarbeiter | null }>[] = [
    {
      accessorKey: "Mitarbeiter.name",
      header: "Wer",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <Link href={"/Einkauf/" + x.Mitarbeiter?.id}>
            {x.Mitarbeiter?.name}
          </Link>
        );
      },
    },
    {
      accessorKey: "Abonniert",
      header: "Abo / Paypal",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <>
            <p className="flex gap-2">Paypal: {x.Paypal ? <Yes /> : <No />}</p>
            <p className="flex gap-2">
              Abonniert: {x.Abonniert ? <Yes /> : <No />}
            </p>
          </>
        );
      },
    },
    {
      accessorKey: "Geld",
      header: "Geld / Pfand",
      cell: ({ row }) => {
        const x = row.original;
        return (
          <>
            <p>Geld: {x.Geld}</p>
            <p>Pfand: {x.Pfand}</p>
          </>
        );
      },
    },
    {
      accessorKey: "Dinge",
      header: "Dinge",
      cell: ({ row }) => {
        const x = row.original;
        return <pre className="font-sans">{x.Dinge}</pre>;
      },
    },
    {
      accessorKey: "Bild1",
      header: "Bilder",
      cell: ({ row }) => {
        const x = row.original;

        let count = 0;
        if (x.Bild1) count += 1;
        if (x.Bild2) count += 1;
        if (x.Bild3) count += 1;

        return (
          <div
            className={cn(
              "grid gap-1",
              count == 1 && "grid-cols-1",
              count == 2 && "grid-cols-2",
              count == 3 && "grid-cols-3",
            )}
          >
            {x.Bild1 && (
              <Image
                src={"/images/" + x.Bild1}
                alt={x.Bild1}
                width={75}
                height={75}
              />
            )}
            {x.Bild2 && (
              <Image
                src={"/images/" + x.Bild2}
                alt={x.Bild2}
                width={75}
                height={75}
              />
            )}
            {x.Bild3 && (
              <Image
                src={"/images/" + x.Bild3}
                alt={x.Bild3}
                width={75}
                height={75}
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <div>
      <div className="print:hidden">
        <EinkaufTable columns={columns} data={Liste.data ?? []} />
      </div>
      <div className="hidden print:block">
        {Liste.data?.map((x) => {
          let count = 0;
          if (x.Bild1) count += 1;
          if (x.Bild2) count += 1;
          if (x.Bild3) count += 1;
          return (
            <div key={x.id} className="mt-2 grid grid-cols-6 gap-2 border-b-2">
              <div className="border-e-2">
                <p>{x.Mitarbeiter?.name}</p>
                <p>Geld: {x.Geld} €</p>
                <p>Pfand: {x.Pfand} €</p>
                <p className="flex items-center gap-2">
                  Paypal: {x.Paypal ? <Yes /> : <No />}
                </p>
                <p className="flex items-center gap-2">
                  Abonniert: {x.Abonniert ? <Yes /> : <No />}
                </p>
              </div>
              <div className="col-span-3">
                <pre className="font-sans">{x.Dinge}</pre>
              </div>
              <div className="col-span-2">
                <div
                  className={cn(
                    "grid gap-1",
                    count == 1 && "grid-cols-1",
                    count == 2 && "grid-cols-2",
                    count == 3 && "grid-cols-3",
                  )}
                >
                  {x.Bild1 && (
                    <Image
                      src={"/images/" + x.Bild1}
                      alt={x.Bild1}
                      width={75}
                      height={75}
                    />
                  )}
                  {x.Bild2 && (
                    <Image
                      src={"/images/" + x.Bild2}
                      alt={x.Bild2}
                      width={75}
                      height={75}
                    />
                  )}
                  {x.Bild3 && (
                    <Image
                      src={"/images/" + x.Bild3}
                      alt={x.Bild3}
                      width={75}
                      height={75}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EinkaufTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="font-base text-main-foreground w-full">
      <div>
        <Table>
          <TableHeader className="font-heading">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-secondary-background text-foreground"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead className="text-foreground" key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="bg-secondary-background text-foreground data-[state=selected]:bg-main data-[state=selected]:text-main-foreground"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell className="px-4 py-2" key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
