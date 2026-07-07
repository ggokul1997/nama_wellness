const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ datasources: { db: { url: 'postgresql://nama_user:nama_password@127.0.0.1:5432/nama_wellness?schema=public' } } });
prisma.$connect().then(() => console.log('Connected!')).catch(console.error).finally(() => process.exit(0));
