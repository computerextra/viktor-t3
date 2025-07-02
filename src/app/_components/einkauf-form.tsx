"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  Abo: z.boolean().default(false).optional(),
  Paypal: z.boolean().default(false).optional(),
  Dinge: z.string(),
  Geld: z.string().optional(),
  Pfand: z.string().optional(),
});

export default function EinkaufForm({ id }: { id: string }) {
  const Einkauf = api.einkauf.get.useQuery({ id });
  const router = useRouter();

  const updater = api.einkauf.update.useMutation({
    onSuccess: async () => {
      router.push("/Einkauf");
    },
  });

  const deleteEinkauf = api.einkauf.delete.useMutation({
    onSuccess: async () => {
      router.push("/Einkauf");
    },
  });

  const skip = api.einkauf.skip.useMutation({
    onSuccess: async () => {
      router.push("/Einkauf");
    },
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      Abo: Einkauf.data?.Abonniert,
      Dinge: Einkauf.data?.Dinge,
      Geld: Einkauf.data?.Geld ?? undefined,
      Pfand: Einkauf.data?.Pfand ?? undefined,
      Paypal: Einkauf.data?.Paypal,
    },
  });

  useEffect(() => {
    form.reset({
      Abo: Einkauf.data?.Abonniert,
      Dinge: Einkauf.data?.Dinge,
      Geld: Einkauf.data?.Geld ?? undefined,
      Pfand: Einkauf.data?.Pfand ?? undefined,
      Paypal: Einkauf.data?.Paypal,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Einkauf.data]);

  if (Einkauf.isLoading) return <>Lädt ...</>;
  if (Einkauf.isFetching) return <>Lädt ...</>;
  if (Einkauf.isError) return <>FEHLER !!!</>;

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await updater.mutateAsync({
      Dinge: values.Dinge,
      mitarbeiterId: id,
      Abo: values.Abo,
      Geld: values.Geld,
      Paypal: values.Paypal,
      Pfand: values.Pfand,
    });
  };

  return (
    <>
      <div className="mt-12 flex justify-center">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <FormField
                control={form.control}
                name="Geld"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Geld</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="Pfand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pfand</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div>
              <div className="grid grid-cols-2 gap-8">
                <FormField
                  control={form.control}
                  name="Abo"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Abo?</FormLabel>
                        <FormDescription>
                          Diesen Einkauf Abonnieren? <br />
                          Der Einkauf wird dadurch <br />
                          jeden Tag Automatisch angezeigt.
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
                <FormField
                  control={form.control}
                  name="Paypal"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                      <div className="space-y-0.5">
                        <FormLabel>Paypal</FormLabel>
                        <FormDescription>
                          Falls vorhanden, kann <br />
                          der Einkäufer eine <br />
                          Bezahlung per Paypal veranlassen
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
              </div>
            </div>
            <FormField
              control={form.control}
              name="Dinge"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dein Einkauf</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Speichern</Button>
          </form>
        </Form>
      </div>
      <Separator className="my-8" />
      <div className="mx-auto grid max-w-[60%] grid-cols-2 gap-8">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"neutral"}>Einkauf löschen</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Einkauf löschen</AlertDialogTitle>
              <AlertDialogDescription>
                Den Einkauf wirklich löschen? <br />
                Durch das löschen wird der Einkauf nicht mehr in der Liste
                angezeigt und muss neu eingegeben und gespeichert werden!
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (Einkauf.data == null) {
                    alert("Noch kein Einkauf für den Mitarbeiter gespeichert!");
                    return;
                  }
                  await deleteEinkauf.mutateAsync({ id: Einkauf.data.id });
                }}
              >
                Löschen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant={"neutral"}>Einkauf auf morgen verschieben</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Einkauf Verschieben</AlertDialogTitle>
              <AlertDialogDescription>
                Hiermit wird der Einkauf auf den nächsten Tag verschoben. Der
                Einkauf wird morgen automatisch wieder angezeigt. Dies
                funktioniert auch, wenn der Einkauf Aboniert wurde.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Abbrechen</AlertDialogCancel>
              <AlertDialogAction
                onClick={async () => {
                  if (Einkauf.data == null) {
                    alert("Noch kein Einkauf für den Mitarbeiter gespeichert!");
                    return;
                  }
                  await skip.mutateAsync({ id: Einkauf.data?.id });
                }}
              >
                Überspringen
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}
