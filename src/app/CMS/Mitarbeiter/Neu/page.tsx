import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../../_components/back-btn";
import MitarbeiterForm from "../_components/form";

export default async function Page() {
  await api.cms.getAbteilungen.prefetch();

  return (
    <HydrateClient>
      <BackBtn href="/CMS/Mitarbeiter" />
      <h1 className="text-center">Neuen Mitarbeiter anlegen</h1>
      <MitarbeiterForm />
    </HydrateClient>
  );
}
