import { test, expect } from '@playwright/test';

test.describe('Student Enrollment & Learning', () => {
  test('should display courses in the public catalog', async ({ page }) => {
    await page.goto('/courses');
    
    // Check if the page loaded
    await expect(page.locator('h1')).toContainText('Explore Courses');
    
    // There should be a search input
    await expect(page.locator('input[placeholder="Search courses..."]')).toBeVisible();
  });

  test('should allow a student to view course details', async ({ page }) => {
    // Assuming a test course slug
    await page.goto('/courses/test-course');
    
    await expect(page.locator('button')).toContainText('Enroll Now');
  });
  
  test('should allow an enrolled student to access learning environment', async ({ page }) => {
    // Assuming an enrolled test course slug
    await page.goto('/student/courses/test-course/learn');
    
    // The learning sidebar should be visible
    await expect(page.locator('aside')).toBeVisible();
    
    // Check for Mark as Complete button
    await expect(page.locator('button:has-text("Complete")')).toBeVisible();
  });
});
