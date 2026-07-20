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
          specialties: ["Yoga", "Meditation"]
        }
      }
    },
  });
  console.log('✅ Created teacher@email.com / password123');

  // 3. Create Employee
  await prisma.user.upsert({
    where: { email: 'employee@email.com' },
    update: {},
    create: {
      email: 'employee@email.com',
      passwordHash,
      emailVerified: true,
      status: 'ACTIVE',
      roles: {
        create: { role: 'EMPLOYEE', productVariant: 'CORPORATE' },
      },
      profile: {
        create: {
          firstName: 'Employee',
          lastName: 'Name',
          timezone: 'Asia/Kolkata',
        },
      },
      companyEmployee: {
        create: {
          company: {
            create: {
              name: 'Test Company',
              admin: {
                create: {
                  email: 'admin@email.com',
                  passwordHash,
                  emailVerified: true,
                  status: 'ACTIVE',
                  roles: {
                    create: {
                      role: 'COMPANY_ADMIN',
                      productVariant: 'CORPORATE'
                    }
                  },
                  profile: {
                    create: {
                      firstName: 'Admin',
                      lastName: 'Name'
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  });
  console.log('✅ Created employee@email.com / password123');

  // Assign course to employee if there's any published course
  const course = await prisma.course.findFirst({ where: { status: 'PUBLISHED' } });
  if (course) {
    const employee = await prisma.user.findUnique({ where: { email: 'employee@email.com' } });
    if (employee) {
      await prisma.enrollment.upsert({
        where: { userId_courseId: { userId: employee.id, courseId: course.id } },
        update: {},
        create: {
          userId: employee.id,
          courseId: course.id,
          status: 'ACTIVE',
        }
      });
      console.log(`✅ Assigned course ${course.slug} to employee@email.com`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
