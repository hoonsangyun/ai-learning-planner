with open("src/utils/prisma.ts", "w") as f:
    f.write("""import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

// Prisma 7 requires passing the connection string explicitely via adapter config
// because omitting url in schema disables default resolution for local sqlite.
const connectionString = "file:" + path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: connectionString });

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
""")
