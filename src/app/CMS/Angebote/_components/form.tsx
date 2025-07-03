"use client";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  date_start: z.date(),
  date_stop: z.date(),
  image: z.string(),
  link: z.string().url(),
  title: z.string(),
  subtitle: z.string().optional(),
  anzeigen: z.boolean(),
});

export default function AbteilungForm({ id }: { id?: string }) {
  const router = useRouter();

  const Abteilung = api.cms.getAngebot.useQuery({ id: id ?? "" });
  const Anleger = api.cms.createAngebot.useMutation({
    onSuccess: () => {
      router.push("/CMS/Angebote");
    },
  });
  const Updater = api.cms.updateAngebot.useMutation({
    onSuccess: () => {
      router.push("/CMS/Angebote");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      anzeigen: Abteilung.data?.anzeigen ?? false,
      date_start: Abteilung.data?.date_start
        ? new Date(Abteilung.data.date_start)
        : new Date(),
      date_stop: Abteilung.data?.date_stop,
      image: Abteilung.data?.image,
      link: Abteilung.data?.link,
      subtitle: Abteilung.data?.subtitle ?? "",
      title: Abteilung.data?.title,
    },
  });

  useEffect(() => {
    if (Abteilung == null) return;
    form.reset({
      anzeigen: Abteilung.data?.anzeigen ?? false,
      date_start: Abteilung.data?.date_start,
      date_stop: Abteilung.data?.date_stop
        ? new Date(Abteilung.data.date_stop)
        : undefined,
      image: Abteilung.data?.image,
      link: Abteilung.data?.link,
      subtitle: Abteilung.data?.subtitle ?? "",
      title: Abteilung.data?.title,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Abteilung.data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    console.log(
      values.date_start.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    );
    console.log(
      values.date_stop.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
    );
    if (Abteilung.data == null) {
      await Anleger.mutateAsync({
        anzeigen: values.anzeigen,
        date_start: values.date_start.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        date_stop: values.date_stop.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        }),
        image: values.image,
        link: values.link,
        subtitle:
          values?.subtitle?.length != null && values.subtitle.length > 0
            ? values.subtitle
            : undefined,
        title: values.title,
      });
      return;
    }
    await Updater.mutateAsync({
      id: Abteilung.data.id,
      anzeigen: values.anzeigen,
      date_start: values.date_start.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      date_stop: values.date_stop.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      }),
      image: values.image,
      link: values.link,
      subtitle:
        values?.subtitle?.length != null && values.subtitle.length > 0
          ? values.subtitle
          : undefined,
      title: values.title,
    });
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
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Title</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subtitle"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sub Title</FormLabel>
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
                <FormLabel>Link</FormLabel>
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
                <FormLabel>Bild</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="anzeigen"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Auf Webseite anzeigen?</FormLabel>
                  <FormDescription>
                    Wenn aktiviert, wird das Angebot auf der Webseite angezeigt
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="date_start"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laufzeit von</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      captionLayout="dropdown"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date_stop"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Laufzeit bis</FormLabel>
                  <FormControl>
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      captionLayout="dropdown"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button type="submit">Speichern</Button>
        </form>
      </Form>
    </div>
  );
}
