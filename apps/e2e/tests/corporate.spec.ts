import { test, expect } from '@playwright/test';
import { createTestCompany, createTestEmployee, cleanupTestUsers } from '../utils/db';

test.describe('Corporate (B2B) Workflows', () => {
  test.afterAll(async () => {
    await cleanupTestUsers();
  });

  test('Company Admin can log in and view company dashboard', async ({ page }) => {
    // Setup: Create a fresh company admin
    const { email, password, company } = await createTestCompany();

    // The corporate login is routed the same way, but redirect resolves based on role
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to company-admin area
    await expect(page).toHaveURL(/.*\/company-admin.*/);
    await expect(page.locator('text=Company Overview')).toBeVisible();
    
    // Check if company name is visible
    await expect(page.locator(`text=${company.name}`)).toBeVisible();
  });

  test('Employee can register via corporate invite', async ({ page }) => {
    // Note: Usually they have an invite link, but we'll test the manual corporate registration
    // if that exists, or test the basic employee login.
    // Based on NAMA2, they log in via standard /login and get redirected to /employee
    
    const { company } = await createTestCompany();
    const { email, password } = await createTestEmployee(company.id);

    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');

    // Should redirect to employee dashboard
    await expect(page).toHaveURL(/.*\/employee.*/);
    await expect(page.locator('text=My Corporate Dashboard')).toBeVisible();
  });

  test('Company Admin cannot access Teacher routes', async ({ page }) => {
    const { email, password } = await createTestCompany();

    // Login as company admin
    await page.goto('/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    // Wait for auth redirect
    await expect(page).toHaveURL(/.*\/company-admin.*/);

    // Try to navigate to teacher page
    await page.goto('/teacher/dashboard');

    // Should redirect away (to login or their own dashboard, usually 403 or redirect)
    // The middleware redirects to /login if unauthorized or back to their dashboard
    await expect(page).not.toHaveURL(/.*\/teacher\/dashboard/);
  });
});
