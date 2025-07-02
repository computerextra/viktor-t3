import { api, HydrateClient } from "@/trpc/server";
import EinkaufKnöppe from "../_components/einkauf-knöppe";
import EinkaufListe from "../_components/einkauf-liste";

export default async function Page() {
  await api.einkauf.liste.prefetch();
  return (
    <HydrateClient>
      <h1 className="text-center print:hidden">Einkaufsliste</h1>
      <h1 className="hidden text-center print:block">
        An Post / Milch denken !
      </h1>
      <div className="print:hidden">
        <EinkaufKnöppe />
      </div>
      <EinkaufListe />
    </HydrateClient>
  );
}
