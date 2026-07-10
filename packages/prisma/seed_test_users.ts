import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding student & teacher users...');
  const passwordHash = await argon2.hash('password123', { type: argon2.argon2id });

  // 1. Create Student
  await prisma.user.upsert({
    where: { email: 'student@email.com' },
    update: {},
    create: {
      email: 'student@email.com',
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'STUDENT', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Student',
          lastName: 'Name',
          timezone: 'Asia/Kolkata',
        },
      },
    },
  });
  console.log('✅ Created student@email.com / password123');

  // 2. Create Teacher
  await prisma.user.upsert({
    where: { email: 'teacher@email.com' },
    update: {},
    create: {
      email: 'teacher@email.com',
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'TEACHER', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Teacher',
          lastName: 'Name',
          timezone: 'Asia/Kolkata',
        },
      },
      teacherProfile: {
        create: {
          bio: 'I am a teacher',
          expertise: ['Yoga', 'Meditation'],
          yearsOfExperience: 5,
        }
      }
    },
  });
  console.log('✅ Created teacher@email.com / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
