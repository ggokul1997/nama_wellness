import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.chatMessage.deleteMany();
  await prisma.chatSession.deleteMany();
  console.log('Cleared all chat messages and sessions.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
