import { PrismaClient } from "@prisma/client";

// Reuse one PrismaClient in development so hot reloads don't open
// a new database connection every time a file changes.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
