import type { User, UserRole, Profile } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';
import { hashOTP } from '../../utils/crypto.js';
import type { Role } from '@nama/shared';

type UserWithRelations = User & {
  roles: UserRole[];
  profile: Profile | null;
};

export const authRepository = {
  async findUserByEmail(email: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { email },
      include: { roles: true, profile: true },
    });
  },

  async findUserById(id: string): Promise<UserWithRelations | null> {
    return prisma.user.findUnique({
      where: { id },
      include: { roles: true, profile: true },
    });
  },

  async createUser(data: {
    email: string;
    passwordHash: string;
    phone?: string;
    role: Role;
    firstName: string;
    lastName: string;
    companyName?: string;
  }): Promise<UserWithRelations> {
    const isCorporate = data.role === 'COMPANY_ADMIN';
    const productVariant = isCorporate ? 'CORPORATE' : 'EDPRO';

    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        phone: data.phone,
        roles: {
          create: {
            role: data.role,
            productVariant,
          },
        },
        profile: {
          create: {
            firstName: data.firstName,
            lastName: data.lastName,
          },
        },
        ...(isCorporate && data.companyName
          ? {
              companyAdmin: {
                create: {
                  name: data.companyName,
                },
              },
            }
          : {}),
      },
      include: { roles: true, profile: true },
    });
  },

  async setEmailVerified(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { emailVerified: true },
    });
  },

  async updateLastLogin(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { lastLogin: new Date() },
    });
  },

  async updatePassword(userId: string, passwordHash: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });
  },

  // OTP management
  async upsertOTP(data: {
    identifier: string;
    purpose: string;
    otp: string;
    expiresAt: Date;
  }): Promise<void> {
    const codeHash = hashOTP(data.otp);
    // Delete any existing OTP for this identifier+purpose before creating a new one
    await prisma.oTPVerification.deleteMany({
      where: { identifier: data.identifier, purpose: data.purpose as never },
    });
    await prisma.oTPVerification.create({
      data: {
        identifier: data.identifier,
        codeHash,
        purpose: data.purpose as never,
        expiresAt: data.expiresAt,
      },
    });
  },

  async findValidOTP(data: {
    identifier: string;
    purpose: string;
    otp: string;
  }): Promise<boolean> {
    const codeHash = hashOTP(data.otp);
    const record = await prisma.oTPVerification.findFirst({
      where: {
        identifier: data.identifier,
        purpose: data.purpose as never,
        codeHash,
        consumed: false,
        expiresAt: { gt: new Date() },
      },
    });
    return record !== null;
  },

  async consumeOTP(data: { identifier: string; purpose: string; otp: string }): Promise<void> {
    const codeHash = hashOTP(data.otp);
    await prisma.oTPVerification.updateMany({
      where: {
        identifier: data.identifier,
        purpose: data.purpose as never,
        codeHash,
      },
      data: { consumed: true },
    });
  },

  async findPasswordHistory(userId: string, limit: number): Promise<{ passwordHash: string }[]> {
    return prisma.passwordHistory.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: { passwordHash: true },
    });
  },

  async addPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    await prisma.passwordHistory.create({
      data: {
        userId,
        passwordHash,
      },
    });
  },
};
