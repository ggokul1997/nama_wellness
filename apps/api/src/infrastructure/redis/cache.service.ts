import { getRedisClient } from './redis.client.js';

// Generic Redis cache service with TTL support.
// Used for: OTP codes, session tokens, rate limits, response caches.

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await getRedisClient().get(key);
    if (!value) return null;
    return JSON.parse(value) as T;
  },

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const serialized = JSON.stringify(value);
    if (ttlSeconds) {
      await getRedisClient().set(key, serialized, 'EX', ttlSeconds);
    } else {
      await getRedisClient().set(key, serialized);
    }
  },

  async del(...keys: string[]): Promise<void> {
    if (keys.length > 0) {
      await getRedisClient().del(...keys);
    }
  },

  async exists(key: string): Promise<boolean> {
    const count = await getRedisClient().exists(key);
    return count > 0;
  },

  async ttl(key: string): Promise<number> {
    return getRedisClient().ttl(key);
  },

  // Atomically increment a counter. Used for replay limits, rate limits.
  async incr(key: string, ttlSeconds?: number): Promise<number> {
    const redis = getRedisClient();
    const count = await redis.incr(key);
    if (count === 1 && ttlSeconds) {
      await redis.expire(key, ttlSeconds);
    }
    return count;
  },
};

// Redis key namespace helpers
export const CacheKeys = {
  // Refresh token blocklist (revoked tokens)
  refreshToken: (hash: string) => `session:refresh:${hash}`,

  // OTP verification codes
  otp: (identifier: string, purpose: string) => `otp:${purpose}:${identifier}`,

  // Recording replay count per enrollment
  recordingViews: (enrollmentId: string, recordingId: string) =>
    `recording:views:${enrollmentId}:${recordingId}`,

  // Rate limits
  rateLimit: (scope: string, identifier: string) => `ratelimit:${scope}:${identifier}`,
} as const;
