import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../../_components/back-btn";
import JobForm from "../_components/form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.cms.getJob.prefetch({ id });

  return (
    <HydrateClient>
      <BackBtn href="/CMS/Jobs" />
      <h1 className="text-center">Job bearbeiten</h1>
      <JobForm id={id} />
    </HydrateClient>
  );
}
