"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";

export function Warenlieferung() {
  const generator = api.warenlieferung.generate.useMutation({
    onSuccess: () => {
      setErstellt(true);
    },
    onError: (e) => {
      alert("Fehler: " + e.message);
    },
  });
  const sender = api.warenlieferung.send.useMutation({
    onSuccess: () => {
      setVersendet(true);
    },
    onError: (e) => {
      alert("Fehler: " + e.message);
    },
  });

  const [erstellt, setErstellt] = useState(false);
  const [versendet, setVersendet] = useState(false);

  return (
    <>
      <h1 className="text-center">Warenlieferung</h1>

      {erstellt ? (
        <>
          <Button onClick={() => sender.mutate()}>
            {sender.isPending ? "Sendet ..." : "Senden"}
          </Button>
        </>
      ) : (
        <>
          <Button
            onClick={() => generator.mutate()}
            disabled={generator.isPending}
          >
            {generator.isPending ? "Erstellt ... " : "Erstellen"}
          </Button>
        </>
      )}

      {versendet && (
        <h2 className="text-center text-pretty">Mail Erfolgreich versendet</h2>
      )}
    </>
  );
}
