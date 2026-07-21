const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { title: 'Changes Requested for Course' }
  });
  for (const n of notifs) {
    if (!n.link.includes('showFeedback=true')) {
      await prisma.notification.update({
        where: { id: n.id },
        data: { link: n.link + '?showFeedback=true' }
      });
      console.log('Updated:', n.id);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
