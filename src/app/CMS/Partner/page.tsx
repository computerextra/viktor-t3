import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../_components/back-btn";
import PartnerTable from "./_components/table";

export default async function Page() {
  await api.cms.getPartners.prefetch();
  return (
    <HydrateClient>
      <BackBtn />
      <h1 className="text-center">CMS - Partner</h1>
      <PartnerTable />
    </HydrateClient>
  );
}
