import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import type { JWTPayload } from '@nama/shared';
import { config } from '../config/index.js';
import { Errors } from '../utils/errors.js';

// Extend the Express Request type so req.user is strongly typed
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

// Verifies the Bearer token in Authorization header and attaches decoded
// payload to req.user. Throws 401 if missing or invalid.
export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.nama_access_token) {
    token = req.cookies.nama_access_token;
  }

  if (!token) {
    throw Errors.unauthorized('No token provided');
  }

  try {
    const payload = jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;
    req.user = payload;
    next();
  } catch {
    throw Errors.unauthorized('Invalid or expired token');
  }
}

// Optional authentication — attaches user if token present, otherwise continues
export function optionalAuthenticate(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else if (req.cookies?.nama_access_token) {
    token = req.cookies.nama_access_token;
  }

  if (token) {
    try {
      req.user = jwt.verify(token, config.JWT_ACCESS_SECRET) as JWTPayload;
    } catch {
      // Ignore — user stays undefined
    }
  }
  next();
}

// JWT helper — issue access token
export function signAccessToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, config.JWT_ACCESS_SECRET, {
    expiresIn: config.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// JWT helper — issue refresh token
export function signRefreshToken(userId: string): string {
  return jwt.sign({ sub: userId }, config.JWT_REFRESH_SECRET, {
    expiresIn: config.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });
}

// JWT helper — verify refresh token
export function verifyRefreshToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, config.JWT_REFRESH_SECRET) as { sub: string };
  } catch {
    throw Errors.unauthorized('Invalid or expired refresh token');
  }
}

// Compute access token expiry in seconds (for client-side timers)
export function getAccessTokenExpiresIn(): number {
  const val = config.JWT_ACCESS_EXPIRES_IN;
  const match = val.match(/^(\d+)([smhd])$/);
  if (!match) return 900;
  const [, n, unit] = match;
  const multiplier: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
  return parseInt(n!) * (multiplier[unit!] ?? 1);
}
