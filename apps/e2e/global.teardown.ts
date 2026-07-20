import { prisma } from './utils/db';

export default async function globalTeardown() {
  console.log('🧹 Tearing down E2E test environment...');
  await prisma.$disconnect();
}
