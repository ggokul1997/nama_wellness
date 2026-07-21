const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { title: 'New Student Enrollment' }
  });
  for (const n of notifs) {
    if (n.link.startsWith('/teacher/courses/')) {
      await prisma.notification.update({
        where: { id: n.id },
        data: { link: '/teacher/dashboard' }
      });
      console.log('Updated:', n.id);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
