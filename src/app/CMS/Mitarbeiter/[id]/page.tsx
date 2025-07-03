import { api, HydrateClient } from "@/trpc/server";
import BackBtn from "../../_components/back-btn";
import MitarbeiterForm from "../_components/form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.cms.getMitarbeiter.prefetch({ id });
  await api.cms.getAbteilungen.prefetch();

  return (
    <HydrateClient>
      <BackBtn href="/CMS/Mitarbeiter" />
      <h1 className="text-center">Mitarbeiter bearbeiten</h1>
      <MitarbeiterForm id={id} />
    </HydrateClient>
  );
}
