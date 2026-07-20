import { test, expect } from '@playwright/test';
import { createTestStudent, cleanupTestUsers } from '../utils/db';

test.describe('Authentication', () => {
  test.afterAll(async () => {
    await cleanupTestUsers();
  });
  test('User can register successfully', async ({ page }) => {
    await page.goto('/register');
    
    const uniqueId = Date.now();
    await page.fill('input[name="firstName"]', 'Jane');
    await page.fill('input[name="lastName"]', 'Doe');
    await page.fill('input[name="email"]', `jane${uniqueId}@test.com`);
    await page.fill('input[name="password"]', 'Password@123');
    await page.fill('input[name="confirmPassword"]', 'Password@123');
    await page.click('button[type="submit"]');

    // Should show email verification screen
    await expect(page.locator('text=Check your email')).toBeVisible();
  });

  test('User can login successfully', async ({ page }) => {
    // Setup: Create a fresh user
    const { email, password } = await createTestStudent();

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Verify successful login by checking URL or dashboard text
    await expect(page).toHaveURL(/.*\/student.*/);
    await expect(page.locator('text=My Learning Dashboard')).toBeVisible();
  });
});
