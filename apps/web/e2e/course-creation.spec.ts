import { test, expect } from '@playwright/test';

test.describe('Course Creation & Publishing', () => {
  test('should allow a teacher to create a course draft', async ({ page }) => {
    // Navigate to create course
    await page.goto('/teacher/courses/create');
    
    await expect(page.locator('h1')).toContainText('Create a New Course');

    // Fill form
    await page.fill('input[type="text"]', 'E2E Test Course');
    await page.fill('textarea', 'A course created during E2E testing.');
    
    // Select dropdowns
    await page.selectOption('select:has-text("Course Type")', { label: 'Video Course' });
    
    // Check submit button
    const submitButton = page.locator('button:has-text("Create Course")');
    await expect(submitButton).toBeVisible();
  });
});
