import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { archivRouter } from "./routers/archiv";
import { cmsRouter } from "./routers/cms";
import { einkaufRouter } from "./routers/einkauf";
import { mitarbeiterRouter } from "./routers/mitarbeiter";
import { warenlieferungRouter } from "./routers/warenlieferung";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  // post: postRouter,
  warenlieferung: warenlieferungRouter,
  archiv: archivRouter,
  einkauf: einkaufRouter,
  mitarbeiter: mitarbeiterRouter,
  cms: cmsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
