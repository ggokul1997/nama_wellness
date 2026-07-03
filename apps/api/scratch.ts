import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const course = await prisma.course.findFirst();
  if (course) {
    await prisma.course.update({
      where: { id: course.id },
      data: { status: 'CHANGES_REQUESTED', rejectedReason: 'Please add more content to module 2.' }
    });
    console.log('Updated course:', course.id);
  } else {
    console.log('No course found');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
