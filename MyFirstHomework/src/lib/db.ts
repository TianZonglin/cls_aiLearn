import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var prisma: PrismaClient | null | undefined;
}

const databaseUrl = process.env.DATABASE_URL;

function createPrismaClient() {
  if (!databaseUrl) {
    return null;
  }

  const adapter = new PrismaPg({
    connectionString: databaseUrl
  });

  return new PrismaClient({ adapter });
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  global.prisma = prisma;
}
