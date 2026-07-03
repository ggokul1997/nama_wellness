import { apiFetch } from './client';
import type {
  RegisterRequest,
  LoginRequest,
  LoginResponse,
  AuthTokens,
  AuthUser,
  VerifyEmailRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
} from '@nama/shared';

export const authApi = {
  register: (data: RegisterRequest) =>
    apiFetch<{ message: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  login: (data: LoginRequest) =>
    apiFetch<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  refresh: (refreshToken: string) =>
    apiFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      auth: false,
    }),

  logout: (refreshToken: string) =>
    apiFetch('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    }),

  verifyEmail: (data: VerifyEmailRequest) =>
    apiFetch<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  resendVerification: (email: string) =>
    apiFetch<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
      auth: false,
    }),

  forgotPassword: (data: ForgotPasswordRequest) =>
    apiFetch<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  resetPassword: (data: ResetPasswordRequest) =>
    apiFetch<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: false,
    }),

  getMe: () => apiFetch<{ user: AuthUser }>('/auth/me'),
};
