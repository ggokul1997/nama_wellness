import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Starting database seed...');

  await seedAdmin();

  console.log('✅ Seed complete.');
  console.log('');
  console.log('  Admin credentials:');
  console.log('  Email:    admin@namawellness.com');
  console.log('  Password: Admin@123456');
}

async function seedAdmin(): Promise<void> {
  const adminEmail = 'admin@namawellness.com';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (existing) {
    console.log('  ⏭  Admin user already exists — skipping');
    return;
  }

  const passwordHash = await argon2.hash('Admin@123456', { type: argon2.argon2id });

  const admin = await prisma.user.create({
    data: {
      email: adminEmail,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'ADMIN', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Platform',
          lastName: 'Admin',
          timezone: 'Asia/Kolkata',
        },
      },
    },
  });

  console.log(`  ✅ Admin created: ${admin.email}`);
}

main()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
