import type {
  RegisterInput,
  LoginInput,
  VerifyEmailInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  LoginResponse,
  AuthTokens,
  AuthUser,
} from '@nama/shared';
import type { User, UserRole, Profile } from '@prisma/client';
import { authRepository } from './auth.repository.js';
import { sessionStore } from '../../infrastructure/redis/session.store.js';
import { emailService } from '../../infrastructure/email/email.service.js';
import {
  hashPassword,
  verifyPassword,
  generateOTP,
} from '../../utils/crypto.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getAccessTokenExpiresIn,
} from '../../middleware/authenticate.js';
import { Errors } from '../../utils/errors.js';
import type { Role } from '@nama/shared';
import { logger } from '../../infrastructure/logger/logger.js';

const OTP_TTL_MINUTES = 15;

type UserWithRelations = User & { roles: UserRole[]; profile: Profile | null };

function toAuthUser(user: UserWithRelations): AuthUser {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    emailVerified: user.emailVerified,
    phoneVerified: user.phoneVerified,
    status: user.status as AuthUser['status'],
    roles: user.roles.map((r) => ({
      role: r.role as Role,
      productVariant: r.productVariant as AuthUser['roles'][0]['productVariant'],
    })),
    profile: user.profile
      ? {
          firstName: user.profile.firstName,
          lastName: user.profile.lastName,
          avatarUrl: user.profile.avatarUrl,
          bio: user.profile.bio,
          timezone: user.profile.timezone,
        }
      : null,
  };
}

function buildTokens(user: UserWithRelations, activeRole?: Role): AuthTokens {
  const roles = user.roles.map((r) => r.role as Role);
  const resolvedRole: Role = activeRole && roles.includes(activeRole) ? activeRole : roles[0]!;

  const accessToken = signAccessToken({
    sub: user.id,
    email: user.email,
    roles,
    activeRole: resolvedRole,
  });
  const refreshToken = signRefreshToken(user.id);

  return {
    accessToken,
    refreshToken,
    expiresIn: getAccessTokenExpiresIn(),
  };
}

export const authService = {
  async register(input: RegisterInput): Promise<{ message: string }> {
    const existing = await authRepository.findUserByEmail(input.email);
    if (existing) {
      throw Errors.conflict('An account with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);
    const user = await authRepository.createUser({
      email: input.email,
      passwordHash,
      phone: input.phone,
      role: input.role as Role,
      firstName: input.firstName,
      lastName: input.lastName,
    });

    await authRepository.addPasswordHistory(user.id, passwordHash);

    // Send email verification OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
    await authRepository.upsertOTP({
      identifier: user.email,
      purpose: 'EMAIL_VERIFICATION',
      otp,
      expiresAt,
    });

    logger.info({ email: user.email, otp }, `🔑 [DEV] Verification OTP code for ${user.email} is: ${otp}`);

    try {
      await emailService.sendVerificationOTP(user.email, otp, input.firstName);
    } catch (err) {
      logger.error({ err, email: user.email }, '📧 Failed to send verification email (port block or unconfigured Ethereal SMTP)');
    }

    return { message: 'Registration successful. Check your email (or server logs) for the verification code.' };
  },

  async login(input: LoginInput): Promise<LoginResponse> {
    const user = await authRepository.findUserByEmail(input.email);

    if (!user) {
      throw Errors.unauthorized('Invalid email or password');
    }

    if (user.status === 'SUSPENDED') {
      throw Errors.forbidden('Your account has been suspended. Contact support.');
    }

    const valid = await verifyPassword(user.passwordHash, input.password);
    if (!valid) {
      throw Errors.unauthorized('Invalid email or password');
    }

    if (!user.emailVerified) {
      throw Errors.forbidden('Please verify your email before logging in.');
    }

    await authRepository.updateLastLogin(user.id);

    const tokens = buildTokens(user, input.activeRole as Role | undefined);
    await sessionStore.store(tokens.refreshToken, user.id);

    return { user: toAuthUser(user), tokens };
  },

  async refresh(rawRefreshToken: string): Promise<AuthTokens> {
    // 1. Validate in Redis
    const session = await sessionStore.validate(rawRefreshToken);
    if (!session) {
      throw Errors.unauthorized('Refresh token is invalid or expired');
    }

    // 2. Validate JWT signature
    const decoded = verifyRefreshToken(rawRefreshToken);

    // 3. Get user
    const user = await authRepository.findUserById(decoded.sub);
    if (!user || user.status === 'SUSPENDED') {
      throw Errors.unauthorized('User not found or suspended');
    }

    // 4. Rotate refresh token
    await sessionStore.revoke(rawRefreshToken);
    const tokens = buildTokens(user);
    await sessionStore.store(tokens.refreshToken, user.id);

    return tokens;
  },

  async logout(rawRefreshToken: string): Promise<void> {
    await sessionStore.revoke(rawRefreshToken);
  },

  async verifyEmail(input: VerifyEmailInput): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw Errors.notFound('User');
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    const valid = await authRepository.findValidOTP({
      identifier: input.email,
      purpose: 'EMAIL_VERIFICATION',
      otp: input.code,
    });

    if (!valid) {
      throw Errors.badRequest('Invalid or expired verification code');
    }

    await authRepository.consumeOTP({
      identifier: input.email,
      purpose: 'EMAIL_VERIFICATION',
      otp: input.code,
    });
    await authRepository.setEmailVerified(user.id);

    return { message: 'Email verified successfully. You can now log in.' };
  },

  async resendVerification(email: string): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(email);
    if (!user) {
      logger.warn({ email }, `🔑 [DEV] Verification resend requested for unregistered email: ${email}`);
      return { message: 'If this email is registered, a verification code has been sent.' };
    }

    if (user.emailVerified) {
      return { message: 'Email is already verified' };
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
    await authRepository.upsertOTP({
      identifier: email,
      purpose: 'EMAIL_VERIFICATION',
      otp,
      expiresAt,
    });

    logger.info({ email, otp }, `🔑 [DEV] Resent verification OTP code for ${email} is: ${otp}`);

    try {
      await emailService.sendVerificationOTP(email, otp, user.profile?.firstName ?? 'User');
    } catch (err) {
      logger.error({ err, email }, '📧 Failed to send verification email (port block or unconfigured Ethereal SMTP)');
    }

    return { message: 'If this email is registered, a verification code has been sent.' };
  },

  async forgotPassword(input: ForgotPasswordInput): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(input.email);
    // Always return the same message to prevent email enumeration
    const message = 'If this email is registered, a password reset code has been sent.';

    if (!user) {
      logger.warn({ email: input.email }, `🔑 [DEV] Password reset requested for unregistered email: ${input.email}`);
      return { message };
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60_000);
    await authRepository.upsertOTP({
      identifier: input.email,
      purpose: 'PASSWORD_RESET',
      otp,
      expiresAt,
    });

    logger.info({ email: input.email, otp }, `🔑 [DEV] Password reset OTP code for ${input.email} is: ${otp}`);

    try {
      await emailService.sendPasswordResetOTP(input.email, otp, user.profile?.firstName ?? 'User');
    } catch (err) {
      logger.error({ err, email: input.email }, '📧 Failed to send password reset email (port block or unconfigured Ethereal SMTP)');
    }

    return { message };
  },

  async resetPassword(input: ResetPasswordInput): Promise<{ message: string }> {
    const user = await authRepository.findUserByEmail(input.email);
    if (!user) {
      throw Errors.badRequest('Invalid or expired reset code');
    }

    const valid = await authRepository.findValidOTP({
      identifier: input.email,
      purpose: 'PASSWORD_RESET',
      otp: input.code,
    });

    if (!valid) {
      throw Errors.badRequest('Invalid or expired reset code');
    }

    const previousPasswords = await authRepository.findPasswordHistory(user.id, 5);
    for (const prev of previousPasswords) {
      const isMatch = await verifyPassword(prev.passwordHash, input.newPassword);
      if (isMatch) {
        throw Errors.badRequest('You cannot use any of your last 5 passwords.');
      }
    }

    const passwordHash = await hashPassword(input.newPassword);
    await authRepository.updatePassword(user.id, passwordHash);
    await authRepository.addPasswordHistory(user.id, passwordHash);
    
    await authRepository.consumeOTP({
      identifier: input.email,
      purpose: 'PASSWORD_RESET',
      otp: input.code,
    });

    return { message: 'Password reset successfully. You can now log in.' };
  },

  async getMe(userId: string): Promise<AuthUser> {
    const user = await authRepository.findUserById(userId);
    if (!user) {
      throw Errors.notFound('User');
    }
    return toAuthUser(user);
  },
};
