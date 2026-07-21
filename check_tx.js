import { PrismaClient } from './node_modules/.pnpm/@prisma+client@6.19.3_prisma@6.19.3_typescript@5.9.3__typescript@5.9.3/node_modules/@prisma/client/index.js';
const prisma = new PrismaClient();

async function check() {
  const txs = await prisma.transaction.findMany();
  console.log("All transactions:", txs);
  
  const teachers = await prisma.user.findMany({ where: { role: 'TEACHER' } });
  console.log("Teachers:", teachers);
  
  const courses = await prisma.course.findMany();
  console.log("Courses:", courses);
}

check().catch(console.error).finally(() => prisma.$disconnect());
