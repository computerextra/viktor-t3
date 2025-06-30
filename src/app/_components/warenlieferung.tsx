"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";
import { useState } from "react";

export function Warenlieferung() {
  const generator = api.warenlieferung.generate.useMutation({
    onSuccess: () => {
      setErstellt(false);
    },
  });

  const [erstellt, setErstellt] = useState(false);

  return (
    <>
      <h1 className="text-center">Warenlieferung</h1>

      <Button onClick={() => generator.mutate()}>
        {erstellt ? "Versenden" : "Erstellen"}
      </Button>
    </>
  );
}
