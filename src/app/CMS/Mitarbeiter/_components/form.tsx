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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { de } from "date-fns/locale";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  abteilungId: z.string().optional(),
  Azubi: z.boolean().default(false).optional(),
  focus: z.string().optional(),
  Geburtstag: z.date().optional(),
  Gruppenwahl: z.string().optional(),
  HomeOffice: z.string().optional(),
  image: z.boolean().default(false).optional(),
  sex: z.string(),
  mail: z.string().email().optional(),
  Mobil_Business: z.string().optional(),
  Mobil_Privat: z.string().optional(),
  name: z.string(),
  short: z.string().optional(),
  Telefon_Business: z.string().optional(),
  Telefon_Intern_1: z.string().optional(),
  Telefon_Intern_2: z.string().optional(),
  Telefon_Privat: z.string().optional(),
});

export default function MitarbeiterForm({ id }: { id?: string }) {
  const router = useRouter();

  const Abteilung = api.cms.getMitarbeiter.useQuery({ id: id ?? "" });
  const Abteilungen = api.cms.getAbteilungen.useQuery();
  const Anleger = api.cms.createMitarbeiter.useMutation({
    onSuccess: () => {
      router.push("/CMS/Mitarbeiter");
    },
  });
  const Updater = api.cms.updateMitarbeiter.useMutation({
    onSuccess: () => {
      router.push("/CMS/Mitarbeiter");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      abteilungId: Abteilung.data?.abteilungId ?? undefined,
      Azubi: Abteilung.data?.Azubi,
      focus: Abteilung.data?.focus ?? undefined,
      Geburtstag: Abteilung.data?.Geburtstag ?? undefined,
      Gruppenwahl: Abteilung.data?.Gruppenwahl ?? undefined,
      HomeOffice: Abteilung.data?.HomeOffice ?? undefined,
      image: Abteilung.data?.image,
      sex: Abteilung.data?.sex ?? undefined,
      mail: Abteilung.data?.mail ?? undefined,
      Mobil_Business: Abteilung.data?.Mobil_Business ?? undefined,
      Mobil_Privat: Abteilung.data?.Mobil_Privat ?? undefined,
      name: Abteilung.data?.name,
      short: Abteilung.data?.short ?? undefined,
      Telefon_Business: Abteilung.data?.Telefon_Business ?? undefined,
      Telefon_Intern_1: Abteilung.data?.Telefon_Intern_1 ?? undefined,
      Telefon_Intern_2: Abteilung.data?.Telefon_Intern_2 ?? undefined,
      Telefon_Privat: Abteilung.data?.Telefon_Privat ?? undefined,
    },
  });

  useEffect(() => {
    if (Abteilung == null) return;
    form.reset({
      abteilungId: Abteilung.data?.abteilungId ?? undefined,
      Azubi: Abteilung.data?.Azubi,
      focus: Abteilung.data?.focus ?? undefined,
      Geburtstag: Abteilung.data?.Geburtstag ?? undefined,
      Gruppenwahl: Abteilung.data?.Gruppenwahl ?? undefined,
      HomeOffice: Abteilung.data?.HomeOffice ?? undefined,
      image: Abteilung.data?.image,
      sex: Abteilung.data?.sex ?? undefined,
      mail: Abteilung.data?.mail ?? undefined,
      Mobil_Business: Abteilung.data?.Mobil_Business ?? undefined,
      Mobil_Privat: Abteilung.data?.Mobil_Privat ?? undefined,
      name: Abteilung.data?.name,
      short: Abteilung.data?.short ?? undefined,
      Telefon_Business: Abteilung.data?.Telefon_Business ?? undefined,
      Telefon_Intern_1: Abteilung.data?.Telefon_Intern_1 ?? undefined,
      Telefon_Intern_2: Abteilung.data?.Telefon_Intern_2 ?? undefined,
      Telefon_Privat: Abteilung.data?.Telefon_Privat ?? undefined,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Abteilung.data]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    console.log(values);
    if (Abteilung.data == null) {
      await Anleger.mutateAsync(values);
      return;
    }
    await Updater.mutateAsync({ id: Abteilung.data.id, ...values });
  };

  if (id && Abteilung.isLoading) return <>Loading...</>;
  if (id && Abteilungen.isLoading) return <>Loading...</>;
  if (id && Abteilung.isFetching) return <>Loading...</>;
  if (id && Abteilungen.isFetching) return <>Loading...</>;
  if (id && Abteilung.isError) return <>FEHLER!!!</>;
  if (id && Abteilungen.isError) return <>FEHLER!!!</>;

  return (
    <div className="mt-12 flex justify-center">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mb-5 space-y-8">
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name*</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sex"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Geschlecht*</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="w">Weiblich</SelectItem>
                      <SelectItem value="m">Männlich</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="abteilungId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Abteilung</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="x">ohne</SelectItem>
                      {Abteilungen.data?.map((x) => (
                        <SelectItem key={x.id} value={x.id}>
                          {x.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Bild auf Webseite?</FormLabel>
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
          <FormField
            control={form.control}
            name="focus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Focus (Komma getrennt)</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="mail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>E-Mail</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator />
          <div className="grid grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="Gruppenwahl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gruppenwahl</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Telefon_Intern_1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon_Intern_1</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Telefon_Intern_2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon_Intern_2</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="HomeOffice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>HomeOffice</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Telefon_Privat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon_Privat</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Telefon_Business"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefon_Business</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Mobil_Privat"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobil_Privat</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="Mobil_Business"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mobil_Business</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="Azubi"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Azubi?</FormLabel>
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

          <FormField
            control={form.control}
            name={"Geburtstag"}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Geburtstag</FormLabel>
                <FormControl>
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    className="rounded-md border shadow-sm"
                    captionLayout="dropdown"
                    locale={de}
                  />
                </FormControl>
                <FormDescription>
                  Gespeicherter Wert:{" "}
                  {Abteilung.data?.Geburtstag?.toLocaleDateString()} <br />
                  Gewählter Wert:{" "}
                  {form.getValues("Geburtstag")?.toLocaleDateString()}
                </FormDescription>
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
