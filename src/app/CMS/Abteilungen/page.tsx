import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../_components/back-btn";
import AbteilungenTable from "./_components/table";

export default async function Page() {
  await api.cms.getAbteilungen.prefetch();
  return (
    <HydrateClient>
      <BackBtn />
      <h1 className="text-center">CMS - Abteilungen</h1>
      <AbteilungenTable />
    </HydrateClient>
  );
}
