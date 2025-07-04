"use client";

import { Button } from "@/components/ui/button";
import ImageCard from "@/components/ui/image-card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { api } from "@/trpc/react";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { z } from "zod";

const StockImage =
  "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80";
const AllowedFileTypes = ["image/png", "image/jpg", "image/jpeg"];

const formSchema = z.object({
  image: z
    .any()
    .refine((file) => file, {
      message: "Bitte ein Bild hochladen",
    })
    .refine((file: File) => file?.size < 1000000 * 3, {
      message: "Das Bild darf nicht größer als 2MB sein!",
    })
    .refine(
      (file: File) => {
        const acceptedTypes = AllowedFileTypes;
        return acceptedTypes.includes(file?.type);
      },
      {
        message:
          "Es können nur .png, .jpg oder .jpeg Dateien hochgeladen werden.",
      },
    ),
});

export default function ImageUpload({ id, nr }: { id: string; nr: number }) {
  const utils = api.useUtils();
  const Images = api.einkauf.getImage.useQuery({ id });
  const imageUpload = api.einkauf.uploadImage.useMutation({
    onSuccess: async () => {
      await utils.einkauf.invalidate();
    },
  });
  const imageDelete = api.einkauf.deleteImage.useMutation({
    onSuccess: async () => {
      await utils.einkauf.invalidate();
      setIsError(false);
      setIsLoading(false);
      setImage(StockImage);
      setImageName("");
    },
  });

  const [isLoading, setIsLoading] = useState<boolean>();
  const [isError, setIsError] = useState<boolean>();

  const form = useForm({
    resolver: zodResolver(formSchema),
  });

  const [image, setImage] = useState("");
  const [imageName, setImageName] = useState("");
  const imageInputRef = useRef<HTMLInputElement>(null);

  const onImageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.files?.[0]) {
        const reader = new FileReader();
        if (!AllowedFileTypes.includes(event.target.files[0].type)) {
          return;
        }
        reader.readAsDataURL(event.target.files[0]);
        reader.onload = () => {
          setImage(reader.result as string);
        };
        form.setValue("image", event.target.files[0]);
        setImageName(event.target.files[0].name.split(".")[0] ?? "Kein Bild");
      }
    },
    [form],
  );

  useEffect(() => {
    if (Images.data == null) {
      setImage(StockImage);
      return;
    }

    switch (nr) {
      case 1: {
        setImageName(Images.data.Bild1 ?? "");
        setImage(Images.data.Bild1 ?? StockImage);
        break;
      }
      case 2: {
        setImageName(Images.data.Bild2 ?? "");
        setImage(Images.data.Bild2 ?? StockImage);
        break;
      }
      case 3: {
        setImageName(Images.data.Bild3 ?? "");
        setImage(Images.data.Bild3 ?? StockImage);
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Images.data]);

  if (Images.isLoading) return <>Lädt...</>;
  if (Images.isFetching) return <>Lädt...</>;
  if (Images.isError) return <>FEHLER!!!</>;

  const onReset = async (style: string) => {
    form.setValue("image", null);
    setImage(StockImage);
    setImageName("");
    if (style == "delete") await imageDelete.mutateAsync({ id, nr });

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setIsError(false);

    try {
      const formData = new FormData();
      formData.append("image", data.image as File);
      // const image = data.image as File;
      const res = await axios.post<{
        fileName: string;
        path: string;
        size: number;
        lastModified: Date;
      } | null>("/api/image", formData);
      if (res.data) {
        console.log(res);
        await imageUpload.mutateAsync({
          id: id,
          imageName: res.data.fileName,
          imageNr: nr,
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const showDelete =
    (nr == 1 && Images.data?.Bild1) ??
    (nr == 2 && Images.data?.Bild2) ??
    (nr == 3 && Images.data?.Bild3);

  return (
    <div className="mx-auto max-w-3xl">
      <ImageCard
        caption={image == StockImage ? "Kein Bild" : imageName}
        imageUrl={image == StockImage ? StockImage : "/images/" + image}
        className="mb-5"
      />

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <Input type="file" onChange={onImageChange} ref={imageInputRef} />
          <p className="text-sm text-red-500">
            {/* eslint-disable-next-line @typescript-eslint/no-base-to-string */}
            {form.formState.errors.image?.message?.toString()}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-8">
            <Button type="submit">Speichern</Button>
            <Button
              type="button"
              className={cn(
                !showDelete && image !== StockImage ? "" : "hidden",
              )}
              onClick={async () => onReset("reset")}
            >
              Zurücksetzen
            </Button>
            <Button
              type="button"
              onClick={async () => onReset("delete")}
              className={cn(showDelete ? "" : "hidden")}
            >
              Bild Löschen
            </Button>
          </div>
        </form>
      </FormProvider>

      {isError ??
        (imageUpload.isError && (
          <p className="text-sm text-red-500">Es ist ein Fehler aufgetreten</p>
        ))}
      {isLoading ??
        (imageUpload.isPending && <p className="text-sm">Lädt hoch!</p>)}
    </div>
  );
}
