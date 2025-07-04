"use client";

import { Button } from "@/components/ui/button";
import ImageCard from "@/components/ui/image-card";
import { api } from "@/trpc/react";
import { UploadButton } from "@/utils/uploadthing";
import { useEffect, useState } from "react";

const StockImage =
  "https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=800&dpr=2&q=80";

export default function ImageUpload({
  id,
  nr,
  setLoading,
}: {
  id: string;
  nr: number;
  setLoading: (arg0: boolean) => void;
}) {
  const utils = api.useUtils();
  const Images = api.einkauf.getImage.useQuery({ id });
  const imageUpload = api.einkauf.uploadImage.useMutation({
    onSuccess: async () => {
      setLoading(false);
      await utils.einkauf.invalidate();
    },
  });
  const imageDelete = api.einkauf.deleteImage.useMutation({
    onSuccess: async () => {
      setLoading(false);
      await utils.einkauf.invalidate();
    },
  });

  const [image, setImage] = useState("");

  useEffect(() => {
    if (Images.data == null) {
      setImage(StockImage);
      return;
    }

    switch (nr) {
      case 1: {
        setImage(Images.data.Bild1 ?? "");
        break;
      }
      case 2: {
        setImage(Images.data.Bild2 ?? "");
        break;
      }
      case 3: {
        setImage(Images.data.Bild3 ?? "");
        break;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [Images.data]);

  if (Images.isLoading) return <>Lädt...</>;
  if (Images.isFetching) return <>Lädt...</>;
  if (Images.isError) return <>FEHLER!!!</>;

  const show = () => {
    switch (nr) {
      case 1:
        return Images.data?.Bild1 != null;
      case 2:
        return Images.data?.Bild2 != null;
      case 3:
        return Images.data?.Bild3 != null;
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      {show() ? (
        <div className="grid">
          <ImageCard
            caption=""
            // @ts-expect-error null geht hier, wird jedoch als falsch gemeldet.
            imageUrl={image == "" ? null : image}
            className="mb-5"
          />
          <Button
            onClick={async () => {
              setLoading(true);
              await imageDelete.mutateAsync({ id, nr });
            }}
          >
            Löschen
          </Button>
        </div>
      ) : (
        <UploadButton
          endpoint="imageUploader"
          onBeforeUploadBegin={(files) => {
            setLoading(true);
            return files;
          }}
          onClientUploadComplete={async (res) => {
            if (res[0])
              await imageUpload.mutateAsync({
                id: id,
                imageNr: nr,
                imageName: res[0]?.key,
              });
          }}
          onUploadError={(error: Error) => {
            // Do something with the error.
            alert(`ERROR! ${error.message}`);
          }}
        />
      )}
    </div>
  );
}
