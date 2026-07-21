import { PrismaClient } from "@prisma/client";

/* Reuse a single PrismaClient across warm serverless invocations (and across
   dev hot-reloads) so we don't exhaust the database connection pool. */
const globalForPrisma = globalThis;
export const prisma = globalForPrisma.__reconPrisma ?? new PrismaClient();
if (!globalForPrisma.__reconPrisma) globalForPrisma.__reconPrisma = prisma;
