import { PrismaClient } from "@prisma/client";

declare global {
  // allow global prisma during development to prevent multiple instances
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") global.prisma = prisma;

if (!process.env.DATABASE_URL) {
  console.warn(
    "Warning: DATABASE_URL is not set. Prisma will attempt to connect using default settings; set DATABASE_URL to your Postgres connection string."
  );
}

export default prisma;
