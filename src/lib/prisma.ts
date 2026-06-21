import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaNeonHttp } from "@prisma/adapter-neon";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getPrismaClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "[Prisma] DATABASE_URL is not set. Check your .env file and restart the dev server."
    );
  }

  // Use HTTP-based Neon adapter — works reliably in Next.js App Router / RSC environment
  const adapter = new PrismaNeonHttp(connectionString, { arrayMode: false, fullResults: true });

  const client = new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
  }

  return client;
}

export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  get(_, prop) { return (getPrismaClient() as any)[prop]; },
});
