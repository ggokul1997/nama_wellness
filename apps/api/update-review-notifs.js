const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const notifs = await prisma.notification.findMany({
    where: { title: 'New Review Received ⭐' }
  });
  for (const n of notifs) {
    if (n.link.startsWith('/teacher/courses/')) {
      const courseId = n.link.split('/').pop();
      const course = await prisma.course.findUnique({ where: { id: courseId } });
      if (course) {
        await prisma.notification.update({
          where: { id: n.id },
          data: { link: `/courses/${course.slug}` }
        });
        console.log('Updated:', n.id);
      }
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
