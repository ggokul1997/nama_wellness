const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { 
      OR: [
        { title: 'Booking Confirmed ✅' },
        { title: 'Booking Cancelled ❌' }
      ]
    }
  });
  for (const n of notifs) {
    if (n.link === '/student/dashboard') {
      await prisma.notification.update({
        where: { id: n.id },
        data: { link: '/student/bookings' }
      });
      console.log('Updated:', n.id);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
