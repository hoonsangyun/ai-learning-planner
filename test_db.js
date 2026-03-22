const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

const adapter = new PrismaBetterSqlite3({ url: "file:./dev.db" });
const prisma = new PrismaClient({ adapter });

async function run() {
  try {
    const problems = await prisma.problem.findMany();
    console.log(problems);
  } catch (e) {
    console.error(e);
  }
}
run();
