import { PrismaClient } from "@prisma/client";

/**
 * Cliente Prisma único (singleton).
 *
 * Em desenvolvimento o Next.js recarrega os módulos a cada alteração; sem o
 * cache global, cada recarga abriria uma nova conexão até esgotar o banco.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = db;
}
