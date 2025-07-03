import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../../_components/back-btn";
import AbteilungForm from "../_components/form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.cms.getAbteilung.prefetch({ id });

  return (
    <HydrateClient>
      <BackBtn href="/CMS/Abteilungen" />
      <h1 className="text-center">Abteilung bearbeiten</h1>
      <AbteilungForm id={id} />
    </HydrateClient>
  );
}
