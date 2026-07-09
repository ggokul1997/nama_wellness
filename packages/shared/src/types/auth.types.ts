import type { Role, ProductVariant, UserStatus } from '../constants/roles.js';

// Authenticated user payload embedded in JWT
export interface JWTPayload {
  sub: string; // user ID
  email: string;
  roles: Role[];
  activeRole: Role;
  iat?: number;
  exp?: number;
}

// User object returned from /auth/me
export interface AuthUser {
  id: string;
  email: string;
  phone: string | null;
  emailVerified: boolean;
  phoneVerified: boolean;
  status: UserStatus;
  roles: UserRoleEntry[];
  profile: UserProfile | null;
}

export interface UserRoleEntry {
  role: Role;
  productVariant: ProductVariant;
}

export interface UserProfile {
  firstName: string;
  lastName: string;
  avatarUrl: string | null;
  bio: string | null;
  timezone: string;
}

// Auth API request/response shapes
export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Extract<Role, 'STUDENT' | 'TEACHER'>;
  phone?: string;
}

export interface CorporateRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  companyName: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  activeRole?: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

export interface LoginResponse {
  user: AuthUser;
  tokens: AuthTokens;
}

export interface RefreshRequest {
  refreshToken: string;
}

export interface VerifyEmailRequest {
  email: string;
  code: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  bio?: string;
  timezone?: string;
}
