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
  name: z.string(),
  image: z.string(),
  link: z.string(),
});

export default function PartnerForm({ id }: { id?: string }) {
  const router = useRouter();

  const Abteilung = api.cms.getPartner.useQuery({ id: id ?? "" });
  const Anleger = api.cms.createPartner.useMutation({
    onSuccess: () => {
      router.push("/CMS/Partner");
    },
  });
  const Updater = api.cms.updatePartner.useMutation({
    onSuccess: () => {
      router.push("/CMS/Partner");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: Abteilung?.data?.name,
      link: Abteilung.data?.link,
      image: Abteilung.data?.image,
    },
  });

  useEffect(() => {
    if (Abteilung == null) return;
    form.reset({
      name: Abteilung?.data?.name,
      link: Abteilung.data?.link,
      image: Abteilung.data?.image,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Abteilung.data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (Abteilung.data == null) {
      await Anleger.mutateAsync(values);
      return;
    }
    await Updater.mutateAsync({ id: Abteilung.data.id, ...values });
  };

  if (id && Abteilung.isLoading) return <>Loading...</>;
  if (id && Abteilung.isFetching) return <>Loading...</>;
  if (id && Abteilung.isError) return <>FEHLER!!!</>;

  return (
    <div className="mt-12 flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          <FormField
            control={form.control}
            name="link"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Link zum Partner</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bildername wie auf Webseite</FormLabel>
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
