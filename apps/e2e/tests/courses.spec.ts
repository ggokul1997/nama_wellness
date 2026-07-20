import { test, expect } from '@playwright/test';
import { createTestStudent, cleanupTestUsers, prisma } from '../utils/db';

test.describe('Courses', () => {
  let testCourse: any;

  test.beforeAll(async () => {
    // Create a category
    const category = await prisma.category.create({
      data: {
        name: `Test Category ${Date.now()}`,
        slug: `test-cat-${Date.now()}`,
      }
    });

    // Create teacher
    const teacher = await prisma.user.create({
      data: {
        email: `creator_${Date.now()}@test.com`,
        passwordHash: 'hash',
        emailVerified: true,
        status: 'ACTIVE',
        roles: { create: { role: 'TEACHER', productVariant: 'EDPRO' } }
      }
    });

    // Create admin for proposer
    const admin = await prisma.user.create({
      data: {
        email: `admin_${Date.now()}@test.com`,
        passwordHash: 'hash',
        emailVerified: true,
        status: 'ACTIVE',
        roles: { create: { role: 'ADMIN', productVariant: 'EDPRO' } }
      }
    });

    // Create a static test course for browsing tests
    testCourse = await prisma.course.create({
      data: {
        title: `Test Course ${Date.now()}`,
        slug: `test-course-${Date.now()}`,
        description: 'Test description',
        status: 'PUBLISHED',
        courseType: 'RECORDED',
        categoryId: category.id,
        teacherId: teacher.id,
        pricings: {
          create: {
            currency: 'INR',
            amount: 99,
            isCurrent: true,
            proposedBy: admin.id
          }
        }
      }
    });
  });

  test.afterAll(async () => {
    if (testCourse?.id) {
      // Explicitly delete pricing first to avoid FK constraint issues on proposer
      await prisma.coursePricing.deleteMany({ where: { courseId: testCourse.id } });
      await prisma.course.delete({ where: { id: testCourse.id } });
      await prisma.category.deleteMany({ where: { id: testCourse.categoryId } });
    }
    await cleanupTestUsers();
  });

  test('User can browse published courses', async ({ page }) => {
    await page.goto('/courses');
    await expect(page.locator(`text=${testCourse.title}`)).toBeVisible();
  });

  test('User can view course details', async ({ page }) => {
    await page.goto(`/courses/${testCourse.slug}`);
    await expect(page.locator(`text=${testCourse.title}`)).toBeVisible();
    await expect(page.locator('text=Test description')).toBeVisible();
  });
});
