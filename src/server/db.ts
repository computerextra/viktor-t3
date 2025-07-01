import { PrismaClient as SageClient } from "sage/sage-database-client";
import { PrismaClient as ViktorClient } from "viktor/viktor-database-client";

import { env } from "@/env";

const createPrismaClient = () =>
  new ViktorClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const createSageClient = () =>
  new SageClient({
    log:
      env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
  sage: ReturnType<typeof createSageClient> | undefined;
};

export const db = globalForPrisma.prisma ?? createPrismaClient();
export const sage = globalForPrisma.sage ?? createSageClient();

if (env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
  globalForPrisma.sage = sage;
}
