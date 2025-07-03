"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(3, {
    message: "Eine Abteilung muss mindestens 3 Zeichen lang sein!",
  }),
});

export default function JobForm({ id }: { id?: string }) {
  const router = useRouter();

  const Abteilung = api.cms.getJob.useQuery({ id: id ?? "" });
  const Anleger = api.cms.createJob.useMutation({
    onSuccess: () => {
      router.push("/CMS/Jobs");
    },
  });
  const Updater = api.cms.updateJob.useMutation({
    onSuccess: () => {
      router.push("/CMS/Jobs");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: Abteilung?.data?.name,
    },
  });

  useEffect(() => {
    if (Abteilung == null) return;
    form.reset({
      name: Abteilung?.data?.name,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Abteilung.data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (Abteilung.data == null) {
      await Anleger.mutateAsync({ name: values.name });
      return;
    }
    await Updater.mutateAsync({ id: Abteilung.data.id, name: values.name });
  };

  if (id && Abteilung.isLoading) return <>Loading...</>;
  if (id && Abteilung.isFetching) return <>Loading...</>;
  if (id && Abteilung.isError) return <>FEHLER!!!</>;

  return (
    <div className="mt-12 flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mb-5 space-y-8">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit">Speichern</Button>
        </form>
      </Form>
    </div>
  );
}
