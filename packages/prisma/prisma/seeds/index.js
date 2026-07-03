import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';
const prisma = new PrismaClient();
async function main() {
    console.log('🌱 Starting database seed...');
    await seedAdmin();
    await seedCategories();
    console.log('✅ Seed complete.');
}
async function seedAdmin() {
    const adminEmail = 'admin@namawellness.com';
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
        console.log('  ⏭  Admin user already exists — skipping');
        return;
    }
    const passwordHash = await argon2.hash('Admin@123456', { type: argon2.argon2id });
    const admin = await prisma.user.create({
        data: {
            email: adminEmail,
            passwordHash,
            emailVerified: true,
            status: 'ACTIVE',
            roles: {
                create: { role: 'ADMIN', productVariant: 'EDPRO' },
            },
            profile: {
                create: {
                    firstName: 'Platform',
                    lastName: 'Admin',
                    timezone: 'Asia/Kolkata',
                },
            },
        },
    });
    console.log(`  ✅ Admin created: ${admin.email} / password: Admin@123456`);
}
async function seedCategories() {
    // Categories model is added in Sprint B.
    console.log('  ⏭  Categories — deferred to Sprint B');
}
main()
    .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
})
    .finally(() => {
    void prisma.$disconnect();
});
//# sourceMappingURL=index.js.map