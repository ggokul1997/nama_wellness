import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  try {
    const courses = await prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        teacher: { include: { profile: true } },
        pricings: { where: { isCurrent: true } }
      }
    });
    console.log('success, count:', courses.length);
  } catch (e) {
    console.error('ERROR:', e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
