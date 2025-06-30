import { HydrateClient } from "@/trpc/server";

export default async function Home() {
  return (
    <HydrateClient>
      <div>
        <h1 className="mt-5 text-center">
          Achtung: Die Seite hat noch nicht alle Funktionen.
        </h1>
        <h2 className="text-center">Hier wird noch fleißig gebastelt.</h2>
      </div>
    </HydrateClient>
  );
}
