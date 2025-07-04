import { HydrateClient } from "@/trpc/server";
import { Warenlieferung } from "./_components/warenlieferung";

export default function Page() {
  return (
    <HydrateClient>
      <div className="flex flex-col gap-8">
        <Warenlieferung />
      </div>
    </HydrateClient>
  );
}
