import { api, HydrateClient } from "@/trpc/server";
import CmsNavigation from "./_components/cms-navigation";

export default async function Page() {
  await api.cms.getCounts.prefetch();
  return (
    <HydrateClient>
      <h1 className="text-center">Computer Extra CMS</h1>
      <CmsNavigation />
    </HydrateClient>
  );
}
