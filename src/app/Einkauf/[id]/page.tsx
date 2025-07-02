import EinkaufForm from "@/app/_components/einkauf-form";
import { api, HydrateClient } from "@/trpc/server";

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
