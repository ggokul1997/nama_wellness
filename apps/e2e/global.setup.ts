import { execSync } from 'child_process';
import * as path from 'path';

export default async function globalSetup() {
  console.log('🔄 Setting up E2E test environment...');
  
  const prismaDir = path.resolve(__dirname, '../../packages/prisma');
  
  try {
    console.log('📦 Resetting test database...');
    // We run prisma migrate reset which will drop the DB, apply migrations
    // We use --skip-seed because E2E tests should not rely on permanent test users.
    // Instead, tests will create their own fixtures.
    execSync('pnpm exec prisma migrate reset --force --skip-seed --skip-generate', {
      cwd: prismaDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        // Ensure prisma doesn't use the dev DB if dotenv-cli isn't wrapping it properly
        DATABASE_URL: process.env.DATABASE_URL,
        DIRECT_URL: process.env.DIRECT_URL,
      }
    });
    
    console.log('✅ Test database ready!');
  } catch (error) {
    console.error('❌ Failed to setup test database:', error);
    throw error;
  }
}
