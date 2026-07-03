import crypto from 'crypto';
import argon2 from 'argon2';

// =============================================================
// Password hashing with Argon2id
// =============================================================

export async function hashPassword(password: string): Promise<string> {
  return argon2.hash(password, { type: argon2.argon2id });
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  return argon2.verify(hash, password);
}

// =============================================================
// Secure random token generation
// =============================================================

export function generateSecureToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString('hex');
}

// Hash a raw token for storage (non-reversible, for DB/Redis)
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Generate a 6-digit numeric OTP
export function generateOTP(): string {
  const otp = crypto.randomInt(100000, 999999);
  return otp.toString();
}

// Hash an OTP for storage (same function as hashToken, aliased for clarity)
export function hashOTP(otp: string): string {
  return hashToken(otp);
}

// Constant-time comparison to prevent timing attacks
export function safeCompare(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
