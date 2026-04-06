require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sessions = await prisma.session.findMany({
    orderBy: { startedAt: 'desc' },
    take: 1,
    include: { quiz: true }
  });
  console.log(JSON.stringify(sessions, (key, value) => 
    typeof value === 'bigint' ? value.toString() : value, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
