import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../../_components/back-btn";
import PartnerForm from "../_components/form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.cms.getPartner.prefetch({ id });

  return (
    <HydrateClient>
      <BackBtn href="/CMS/Partner" />
      <h1 className="text-center">Partner bearbeiten</h1>
      <PartnerForm id={id} />
    </HydrateClient>
  );
}
