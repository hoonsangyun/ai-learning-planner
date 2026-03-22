with open("src/utils/prisma.ts", "w") as f:
    f.write("""import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// In Prisma 7, when using driverAdapters with no url in schema, we pass the URL explicitly to the adapter
const connectionString = "file:" + path.join(process.cwd(), "dev.db");
// @ts-ignore
const adapter = new PrismaBetterSqlite3({ url: connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
""")
