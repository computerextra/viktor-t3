import { HydrateClient } from "@/trpc/server";
import ArchiveForm from "../_components/archive-form";

export default function Page() {
  return (
    <HydrateClient>
      <h1 className="text-center">CE Archiv</h1>

      <ArchiveForm />
    </HydrateClient>
  );
}
