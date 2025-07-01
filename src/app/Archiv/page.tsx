import { HydrateClient } from "@/trpc/server";
import ArchiveForm from "../_components/archive-form";
import SyncArchive from "../_components/sync-archive";

export default function Page() {
  return (
    <HydrateClient>
      <h1 className="text-center">CE Archiv</h1>
      <SyncArchive />
      <ArchiveForm />
    </HydrateClient>
  );
}
