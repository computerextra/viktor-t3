import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../_components/back-btn";
import MitarbeiterTable from "./_components/table";

export default async function Page() {
  await api.cms.getAbteilungen.prefetch();
  return (
    <HydrateClient>
      <BackBtn />
      <h1 className="text-center">CMS - Mitarbeiter</h1>
      <MitarbeiterTable />
    </HydrateClient>
  );
}
