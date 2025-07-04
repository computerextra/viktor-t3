import { api, HydrateClient } from "@/trpc/server";
import EinkaufForm from "../_components/einkauf-form";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await api.einkauf.get.prefetch({ id });

  return (
    <HydrateClient>
      <EinkaufForm id={id} />
    </HydrateClient>
  );
}
