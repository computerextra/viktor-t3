import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../_components/back-btn";
import AbteilungenTable from "./_components/table";

export default async function Page() {
  await api.cms.getJobs.prefetch();
  return (
    <HydrateClient>
      <BackBtn />
      <h1 className="text-center">CMS - Jobs</h1>
      <AbteilungenTable />
    </HydrateClient>
  );
}
