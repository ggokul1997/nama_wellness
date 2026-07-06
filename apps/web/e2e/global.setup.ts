import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authenticate', async ({ request }) => {
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
  };

  // 1. Try to register the user (ignoring error if they already exist)
  const regRes = await request.post('/api/v1/auth/register', {
    data: { ...testUser, confirmPassword: testUser.password, firstName: 'Test', lastName: 'User', role: 'TEACHER' },
  });
  console.log('Register response:', await regRes.text());

  // 1.5. Verify email via test helper
  const verifyRes = await request.post('/api/v1/auth/test-verify', {
    data: { email: testUser.email },
  });
  console.log('Verify response:', await verifyRes.json());

  // 2. Login to get the auth cookies
  const response = await request.post('/api/v1/auth/login', {
    data: testUser,
  });

  if (!response.ok()) {
    console.error('Login failed:', await response.text());
  }
  expect(response.ok()).toBeTruthy();

  // 3. Save the storage state (cookies) to be reused in tests
  await request.storageState({ path: authFile });
});
