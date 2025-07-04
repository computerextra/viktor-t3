"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { api } from "@/trpc/react";
import Link from "next/link";

export default function CmsNavigation() {
  const Counts = api.cms.getCounts.useQuery();

  if (Counts.isLoading) return <>Lädt...</>;
  if (Counts.isFetching) return <>Lädt...</>;
  if (Counts.isError) return <>FEHLER!!!</>;

  const data = [
    {
      title: "Abteilungen",
      count: Counts.data?.Abteilungen,
    },
    {
      title: "Angebote",
      count: Counts.data?.Angebote,
    },
    {
      title: "Jobs",
      count: Counts.data?.Jobs,
    },
    {
      title: "Mitarbeiter",
      count: Counts.data?.Mitarbeiter,
    },
    {
      title: "Partner",
      count: Counts.data?.Partner,
    },
  ];

  return (
    <Table className="mt-5">
      <TableHeader>
        <TableRow>
          <TableHead>Titel</TableHead>
          <TableHead>Menge der Datensätze</TableHead>
          <TableHead className="text-right">Go There</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((x) => (
          <TableRow key={x.title}>
            <TableCell className="font-base">{x.title}</TableCell>
            <TableCell>{x.count}</TableCell>
            <TableCell className="text-right">
              <Button asChild variant={"reverse"}>
                <Link href={"/CMS/" + x.title}>Link</Link>
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
