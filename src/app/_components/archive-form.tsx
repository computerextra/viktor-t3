"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import type { ColumnDef } from "@tanstack/react-table";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import ArchiveTable from "./archive-table";

const formSchema = z.object({
  search: z.string().min(3, {
    message: "Es müssen mindestens 3 Zeichen eingegeben werden!",
  }),
});

function makeid(length: number): string {
  let result = "";
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default function ArchiveForm() {
  const [results, setResults] = useState<
    undefined | { id: number; title: string }[]
  >(undefined);
  const utils = api.useUtils();
  const sucher = api.archiv.search.useMutation({
    onSuccess: async (data) => {
      await utils.archiv.invalidate();
      setResults(data);
    },
  });

  const getter = api.archiv.get.useMutation({
    onSuccess: (data) => {
      const linkSource = `data:application/pdf;base64,${data}`;
      const downloadLink = document.createElement("a");
      const fileName = makeid(5) + ".pdf";
      downloadLink.href = linkSource;
      downloadLink.download = fileName;
      downloadLink.click();
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await sucher.mutateAsync({ search: values.search });
  };

  const columns: ColumnDef<{ id: number; title: string }>[] = [
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => {
        const x = row.original;

        return (
          <p
            className="cursor-pointer"
            onClick={async () => getter.mutateAsync({ id: x.id })}
          >
            {x?.title}
          </p>
        );
      },
    },
  ];

  return (
    <>
      <div className="mt-12 flex justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="search"
              render={({ field }) => (
                <FormItem>
                  <div className="flex w-full max-w-sm items-center space-x-2">
                    <FormControl>
                      <Input
                        placeholder="Suche..."
                        disabled={sucher.isPending}
                        {...field}
                      />
                    </FormControl>
                    <Button
                      variant="noShadow"
                      type="submit"
                      disabled={sucher.isPending}
                    >
                      {sucher.isPending ? "Sucht..." : "Suchen"}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
      <div className="mt-5">
        <ArchiveTable columns={columns} data={results ?? []} />
      </div>
    </>
  );
}
