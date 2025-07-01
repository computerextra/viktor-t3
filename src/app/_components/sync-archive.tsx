"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/trpc/react";

export default function SyncArchive() {
  const sync = api.archiv.sync.useMutation({
    onSuccess: () => {
      location.reload();
    },
  });

  return (
    <Button
      onClick={async () => await sync.mutateAsync()}
      disabled={sync.isPending}
    >
      {sync.isPending ? "Sync......" : "Synchronisieren"}
    </Button>
  );
}
