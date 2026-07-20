import { PrismaClient } from '@nama/prisma';
// Use dynamic import for argon2 to avoid bundling issues if any
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

export async function createTestAdmin() {
  const email = `admin_${Date.now()}@test.com`;
  const password = 'Password@123';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const admin = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'ADMIN', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'Admin',
        },
      },
    },
  });

  return { user: admin, email, password };
}

export async function createTestTeacher() {
  const email = `teacher_${Date.now()}@test.com`;
  const password = 'Password@123';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const teacher = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'TEACHER', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'Teacher',
          bio: 'Test bio',
        },
      },
      teacherProfile: {
        create: {}
      }
    },
  });

  return { user: teacher, email, password };
}

export async function createTestStudent() {
  const email = `student_${Date.now()}@test.com`;
  const password = 'Password@123';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const student = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'STUDENT', productVariant: 'EDPRO' },
      },
      profile: {
        create: {
          firstName: 'Test',
          lastName: 'Student',
        },
      },
    },
  });

  return { user: student, email, password };
}

export async function createTestCompany() {
  const email = `company_${Date.now()}@test.com`;
  const password = 'Password@123';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const adminUser = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'COMPANY_ADMIN', productVariant: 'CORP' },
      },
      profile: {
        create: {
          firstName: 'Corp',
          lastName: 'Admin',
        },
      },
    },
  });

  const company = await prisma.company.create({
    data: {
      name: `Test Corp ${Date.now()}`,
      slug: `test-corp-${Date.now()}`,
      adminId: adminUser.id,
      seatsTotal: 10,
      seatsUsed: 0,
      subscriptionPlan: 'PRO',
      subscriptionStatus: 'ACTIVE',
    },
  });

  return { user: adminUser, email, password, company };
}

export async function createTestEmployee(companyId: string) {
  const email = `employee_${Date.now()}@test.com`;
  const password = 'Password@123';
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

  const employee = await prisma.user.create({
    data: {
      email,
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'EMPLOYEE', productVariant: 'CORP' },
      },
      profile: {
        create: {
          firstName: 'Corp',
          lastName: 'Employee',
        },
      },
    },
  });

  await prisma.companyEmployee.create({
    data: {
      companyId,
      userId: employee.id,
      status: 'ACTIVE',
    },
  });

  return { user: employee, email, password };
}

export async function cleanupTestUsers() {
  // No-op: tests run in parallel, global deleteMany causes FK conflicts.
  // DB is wiped in global.setup.ts anyway.
}

export { prisma };
