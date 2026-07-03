import { cache, CacheKeys } from './cache.service.js';
import { hashToken } from '../../utils/crypto.js';

const REFRESH_TOKEN_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

// Stores refresh token hash in Redis so we can quickly validate + revoke
// without hitting the database on every refresh request.
export const sessionStore = {
  async store(rawToken: string, userId: string): Promise<void> {
    const hash = hashToken(rawToken);
    await cache.set(CacheKeys.refreshToken(hash), { userId }, REFRESH_TOKEN_TTL);
  },

  async validate(rawToken: string): Promise<{ userId: string } | null> {
    const hash = hashToken(rawToken);
    return cache.get<{ userId: string }>(CacheKeys.refreshToken(hash));
  },

  async revoke(rawToken: string): Promise<void> {
    const hash = hashToken(rawToken);
    await cache.del(CacheKeys.refreshToken(hash));
  },

  async revokeByHash(hash: string): Promise<void> {
    await cache.del(CacheKeys.refreshToken(hash));
  },
};
