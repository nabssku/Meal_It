import "server-only";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _prismaInstance: PrismaClient | undefined;
}

function buildPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString || connectionString.trim() === "") {
    console.error("[prisma.ts] DATABASE_URL is missing at build time. Keys:", Object.keys(process.env).filter(k => k.startsWith("NEXT") || k === "NODE_ENV" || k === "DATABASE_URL"));
    throw new Error(
      "[Prisma] DATABASE_URL is not set – check your .env file and restart the dev server."
    );
  }

  console.log("[prisma.ts] Building PrismaClient. DATABASE_URL length:", connectionString.trim().length);

  const pool = new Pool({
    connectionString: connectionString.trim(),
  });

  const adapter = new PrismaPg(pool);

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Fully lazy singleton — only built when a property is first accessed at request time
const proxyHandler: ProxyHandler<object> = {
  get(_target, prop: string | symbol) {
    if (!global._prismaInstance) {
      global._prismaInstance = buildPrismaClient();
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (global._prismaInstance as any)[prop];
  },
};

export const prisma: PrismaClient = new Proxy(
  Object.create(null),
  proxyHandler
) as unknown as PrismaClient;
